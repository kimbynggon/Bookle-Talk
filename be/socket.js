const logger = require('./utils/logger');
const chatController = require('./controllers/chatController');

// ✅ 닉네임 정제 함수 (chatController에서 가져오기)
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

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join a book chat room
    socket.on('join_room', (bookId, callback) => {
      socket.join(`book_${bookId}`);
      logger.info(`User ${socket.id} joined room for book ${bookId}`);
      if (callback) callback();
    });

    // ✅ 강화된 채팅 메시지 처리
    socket.on('send_message', async (data) => {
      const { bookId, userId, username, nickname, message } = data;
      
      try {
        // ✅ 닉네임 정제 강화
        const rawNickname = nickname || username || '익명';
        const cleanedNickname = sanitizeNickname(rawNickname);
        const actualUserId = userId || 'anonymous';
        
        console.log('💬 소켓 메시지 수신:', {
          bookId,
          userId: actualUserId,
          rawNickname: rawNickname,
          cleanedNickname: cleanedNickname,
          message: message?.substring(0, 50) + (message?.length > 50 ? '...' : '')
        });
        
        // ✅ 입력 검증 강화
        if (!bookId || !actualUserId || !cleanedNickname || !message?.trim()) {
          socket.emit('message_error', { 
            error: 'Invalid message data',
            details: 'bookId, userId, nickname, and message are required',
            debug: { bookId, actualUserId, cleanedNickname, hasMessage: !!message?.trim() }
          });
          return;
        }
        
        // 메시지 길이 체크
        if (message.trim().length > 500) {
          socket.emit('message_error', { 
            error: 'Message too long',
            details: 'Maximum 500 characters allowed'
          });
          return;
        }
        
        // ✅ DB에 저장 (정제된 닉네임 사용)
        const savedMessage = await chatController.createChat(
          bookId, 
          actualUserId, 
          cleanedNickname, // ✅ 정제된 닉네임 사용
          message.trim()
        );
        
        console.log('✅ 메시지 DB 저장 완료:', {
          id: savedMessage.id,
          bookId,
          userId: actualUserId,
          nickname: cleanedNickname,
          originalNickname: rawNickname
        });
        
        // ✅ 브로드캐스트 메시지 구성 (정제된 닉네임 사용)
        const broadcastMessage = {
          id: savedMessage.id,
          bookId: parseInt(bookId),
          userId: actualUserId,
          username: cleanedNickname,
          nickname: cleanedNickname,
          message: message.trim(),
          created_at: savedMessage.created_at || new Date().toISOString()
        };
        
        console.log('📡 브로드캐스트 메시지:', broadcastMessage);
        
        // 룸의 모든 사용자에게 브로드캐스트 (전송자 포함)
        io.to(`book_${bookId}`).emit('receive_message', broadcastMessage);
        
      } catch (error) {
        logger.error('Error sending message:', error);
        console.error('💬 메시지 전송 오류:', {
          error: error.message,
          data: { bookId, userId, nickname: nickname || username, message: message?.substring(0, 50) }
        });
        
        // 에러 발생 시 전송자에게 알림
        socket.emit('message_error', { 
          error: 'Failed to send message',
          details: error.message 
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };