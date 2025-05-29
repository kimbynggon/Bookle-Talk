const { Chat, Book, User, sequelize } = require('../models');
const logger = require('../utils/logger');

// ✅ 닉네임 정제 함수 추가
const sanitizeNickname = (nickname) => {
  if (!nickname) return '익명사용자';
  
  // 문제가 되는 문자들 제거
  let cleaned = nickname
    .replace(/[ᅟᅠ\u1160\u1161\u115F\u3164]/g, '') // 한글 채움 문자 제거
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 제로 폭 문자 제거
    .replace(/[^\w\sㄱ-ㅎ가-힣\u4e00-\u9fff]/g, '') // 허용된 문자만 남기기
    .trim();
  
  // 빈 문자열이거나 너무 짧으면 기본값 사용
  if (!cleaned || cleaned.length < 1) {
    return '사용자' + Math.floor(Math.random() * 1000);
  }
  
  // 너무 긴 닉네임은 자르기
  if (cleaned.length > 20) {
    cleaned = cleaned.substring(0, 20);
  }
  
  return cleaned;
};

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
      limit: 100,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_id', 'nickname'],
          required: false
        }
      ]
    });
    
    // ✅ 채팅 데이터 변환 시 닉네임 정제
    const chatsData = chats.map((chat) => ({
      id: chat.id,
      username: sanitizeNickname(chat.nickname || chat.user?.nickname),
      nickname: sanitizeNickname(chat.nickname || chat.user?.nickname),
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
      error: error.message
    });
  }
};

// ✅ 강화된 채팅 메시지 생성 함수
const createChat = async (bookId, userId, nickname, message) => {
  const transaction = await sequelize.transaction();
  
  try {
    // ✅ 닉네임 정제
    const cleanNickname = sanitizeNickname(nickname);
    
    logger.info(`💬 채팅 생성 시도: 책 ${bookId}, 사용자 ${userId}, 원본 닉네임: "${nickname}", 정제된 닉네임: "${cleanNickname}"`);
    
    // 입력 검증
    if (!bookId || !userId || !cleanNickname || !message?.trim()) {
      throw new Error('Missing required parameters: bookId, userId, nickname, or message');
    }
    
    const numericBookId = parseInt(bookId, 10);
    if (isNaN(numericBookId)) {
      throw new Error('Invalid bookId: must be a number');
    }
    
    // 개발 모드에서는 사용자 확인 건너뛰기
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 개발 모드: 사용자 확인 건너뛰기');
    } else {
      // 프로덕션에서는 사용자 확인
      const user = await User.findOne({ 
        where: { user_id: userId },
        transaction,
        attributes: ['id', 'user_id', 'nickname']
      });
      
      if (!user) {
        logger.warn(`⚠️ 사용자 정보 없음: ${userId}`);
      }
    }

    // 책 존재 확인
    const book = await Book.findByPk(numericBookId, { transaction });
    if (!book) {
      throw new Error(`Book not found: ${numericBookId}`);
    }

    // ✅ 채팅 생성 (정제된 닉네임 사용)
    const chat = await Chat.create({
      book_id: numericBookId,
      user_id: userId,
      nickname: cleanNickname, // ✅ 정제된 닉네임 저장
      message: message.trim()
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`✅ 채팅 생성 완료: ID ${chat.id}, 닉네임: "${cleanNickname}"`);
    return chat;
  } catch (error) {
    await transaction.rollback();
    logger.error('채팅 생성 오류:', error);
    throw error;
  }
};

// ✅ 수정된 메시지 전송 함수 
const sendMessage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, nickname, message } = req.body;
    
    // JWT에서 user_id 가져오기 (우선순위: JWT > body)
    const actualUserId = req.user?.user_id || userId;
    const actualNickname = req.user?.nickname || nickname;
    
    // ✅ 닉네임 정제
    const cleanNickname = sanitizeNickname(actualNickname);
    
    logger.info(`💬 메시지 전송 요청: 사용자 ${actualUserId}, 원본 닉네임 "${actualNickname}", 정제된 닉네임 "${cleanNickname}"`);
    
    // 입력 검증
    if (!actualUserId || !cleanNickname || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID, nickname and message are required',
        debug: { actualUserId, cleanNickname, hasMessage: !!message?.trim() }
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
    
    // ✅ 정제된 닉네임으로 채팅 생성
    const newChat = await createChat(numericBookId, actualUserId, cleanNickname, message.trim());
    
    const responseData = {
      id: newChat.id,
      nickname: cleanNickname,
      username: cleanNickname,
      message: newChat.message,
      comment: newChat.message,
      created_at: newChat.created_at,
      user_id: actualUserId,
      book_id: numericBookId
    };
    
    logger.info(`✅ 메시지 전송 완료: 책 ${numericBookId}, 사용자 ${actualUserId}, 닉네임 "${cleanNickname}"`);
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: responseData
    });
  } catch (error) {
    logger.error('메시지 전송 오류:', error);
    
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

// 메시지 신고 기능
const reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, nickname, reason } = req.body;
    
    if (!messageId || !userId || !nickname || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Message ID, user ID, and reason are required'
      });
    }
    
    const message = await Chat.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.user_id === userId || message.nickname === nickname) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report your own message'
      });
    }
    
    logger.info(`🚨 메시지 신고: ID ${messageId}, 신고자 ${userId || nickname}, 사유: ${reason}`);
    
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
  reportMessage,
  sanitizeNickname // ✅ 유틸리티 함수로 export
};