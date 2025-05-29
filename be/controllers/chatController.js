const { Chat, Book, User, sequelize } = require('../models');
const logger = require('../utils/logger');

// 특정 책의 채팅 메시지 조회
const getChatsByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    const numericBookId = parseInt(bookId, 10);
    
    logger.info(`💬 책 ${numericBookId}의 채팅 조회 시작`);
    
    // 책 존재 확인
    const book = await Book.findByPk(numericBookId);
    if (!book) {
      logger.warn(`📚 책을 찾을 수 없음: ID ${numericBookId}`);
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // 채팅 메시지 조회 (최신 100개만)
    const chats = await Chat.findAll({
      where: { book_id: numericBookId },
      order: [['created_at', 'ASC']],
      limit: 100, // 성능을 위해 제한
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_id', 'nickname'],
          required: false // LEFT JOIN으로 변경
        }
      ]
    });
    
    // 채팅 데이터 변환
    const chatsData = chats.map((chat) => ({
      id: chat.id,
      username: chat.user?.user_id || chat.user_id || '익명',
      message: chat.message,
      comment: chat.message,
      created_at: chat.created_at,
      user_id: chat.user_id,
      book_id: chat.book_id
    }));
    
    logger.info(`💬 책 ${numericBookId}의 채팅 ${chatsData.length}개 조회 완료`);
    
    return res.status(200).json({
      success: true,
      data: chatsData,
      count: chatsData.length
    });
  } catch (error) {
    logger.error(`채팅 조회 오류:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        bookId: req.params.bookId
      } : undefined
    });
  }
};

// 채팅 메시지 생성 함수 (개선됨)
const createChat = async (bookId, userId, message) => {
  const transaction = await sequelize.transaction();
  
  try {
    logger.info(`💬 채팅 생성 시도: 책 ${bookId}, 사용자 ${userId}`);
    
    // 입력 검증
    if (!bookId || !userId || !message?.trim()) {
      throw new Error('Missing required parameters: bookId, userId, or message');
    }
    
    const numericBookId = parseInt(bookId, 10);
    if (isNaN(numericBookId)) {
      throw new Error('Invalid bookId: must be a number');
    }
    
    // 사용자 존재 확인
    const user = await User.findOne({ 
      where: { user_id: userId },
      transaction
    });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 책 존재 확인
    const book = await Book.findByPk(numericBookId, { transaction });
    if (!book) {
      throw new Error(`Book not found: ${numericBookId}`);
    }

    // 채팅 생성
    const chat = await Chat.create({
      book_id: numericBookId,
      user_id: userId,
      message: message.trim()
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`💬 채팅 생성 완료: ID ${chat.id}`);
    return chat;
  } catch (error) {
    await transaction.rollback();
    logger.error('채팅 생성 오류:', error);
    throw error;
  }
};

// 채팅 메시지 전송 함수 (개선됨)
const sendMessage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, message } = req.body;
    
    // JWT에서 user_id 가져오기 (우선순위: JWT > body)
    const actualUserId = req.user?.user_id || userId;
    
    // 입력 검증
    if (!actualUserId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }
    
    if (message.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 500 characters)'
      });
    }
    
    const numericBookId = parseInt(bookId, 10);
    if (isNaN(numericBookId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    
    // 채팅 생성
    const newChat = await createChat(numericBookId, actualUserId, message.trim());
    
    // 사용자 정보 조회
    const user = await User.findOne({ 
      where: { user_id: actualUserId },
      attributes: ['id', 'user_id', 'nickname']
    });
    
    const responseData = {
      id: newChat.id,
      username: user?.user_id || actualUserId,
      message: newChat.message,
      comment: newChat.message,
      created_at: newChat.created_at,
      user_id: actualUserId,
      book_id: numericBookId
    };
    
    logger.info(`💬 메시지 전송 완료: 책 ${numericBookId}, 사용자 ${user?.user_id || actualUserId}`);
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: responseData
    });
  } catch (error) {
    logger.error('메시지 전송 오류:', error);
    
    // 구체적인 에러 메시지 제공
    let errorMessage = 'Failed to send message';
    if (error.message.includes('User not found')) {
      errorMessage = 'User not found';
    } else if (error.message.includes('Book not found')) {
      errorMessage = 'Book not found';
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 메시지 신고 기능 (개선됨)
const reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reason } = req.body;
    
    // 입력 검증
    if (!messageId || !userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Message ID, user ID, and reason are required'
      });
    }
    
    // 메시지 존재 확인
    const message = await Chat.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // 자기 메시지 신고 방지
    if (message.user_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report your own message'
      });
    }
    
    logger.info(`🚨 메시지 신고: ID ${messageId}, 신고자 ${userId}, 사유: ${reason}`);
    
    // TODO: 실제 신고 로직 구현 (데이터베이스에 저장 등)
    
    return res.status(200).json({
      success: true,
      message: '신고가 접수되었습니다.'
    });
  } catch (error) {
    logger.error('메시지 신고 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to report message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getChatsByBookId,
  createChat,
  sendMessage,
  reportMessage
};