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
    
    // 채팅 메시지 조회
    const chats = await Chat.findAll({
      where: { book_id: numericBookId },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_id', 'nickname']
        }
      ]
    });
    
    // ✅ 채팅 데이터 변환 - user_id만 표시
    const chatsData = chats.map((chat) => ({
      id: chat.id,
      username: chat.user?.user_id || chat.user_id || '익명',  // ✅ user_id 표시 (nickname 대신)
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

// ✅ 수정된 채팅 메시지 생성 함수
const createChat = async (bookId, userId, message) => {
  try {
    logger.info(`💬 채팅 생성 시도: 책 ${bookId}, 사용자 ${userId}`);
    
    // ✅ user_id (문자열)로 사용자 확인
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }

    const chat = await Chat.create({
      book_id: bookId,
      user_id: userId,  // ✅ 문자열 user_id 저장
      message: message
    });
    
    logger.info(`💬 채팅 생성 완료: ID ${chat.id}`);
    return chat;
  } catch (error) {
    logger.error('채팅 생성 오류:', error);
    throw error;
  }
};

// ✅ 수정된 채팅 메시지 전송 함수
const sendMessage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, message } = req.body;
    
    // ✅ JWT에서 user_id (문자열) 가져오기
    const actualUserId = req.user?.user_id || userId;
    
    if (!actualUserId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }
    
    const numericBookId = parseInt(bookId, 10);
    
    // Check if book exists
    const book = await Book.findByPk(numericBookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const newChat = await createChat(numericBookId, actualUserId, message.trim());
    
    // ✅ 사용자 정보 조회 (user_id로)
    const user = await User.findOne({ 
      where: { user_id: actualUserId },
      attributes: ['id', 'user_id', 'nickname']
    });
    
    const responseData = {
      id: newChat.id,
      username: user?.user_id || actualUserId,  // ✅ user_id 표시 (nickname 대신)
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
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// 메시지 신고 기능
const reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reason } = req.body;
    
    logger.info(`🚨 메시지 신고: ID ${messageId}, 신고자 ${userId}, 사유: ${reason}`);
    
    return res.status(200).json({
      success: true,
      message: '신고가 접수되었습니다.'
    });
  } catch (error) {
    logger.error('메시지 신고 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to report message',
      error: error.message
    });
  }
};

module.exports = {
  getChatsByBookId,
  createChat,
  sendMessage,
  reportMessage
};