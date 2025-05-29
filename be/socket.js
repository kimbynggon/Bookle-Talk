const logger = require('./utils/logger');
const chatController = require('./controllers/chatController');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join a book chat room
    socket.on('join_room', (bookId, callback) => {
      socket.join(`book_${bookId}`);
      logger.info(`User ${socket.id} joined room for book ${bookId}`);
      if (callback) callback();
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      const { bookId, userId, username, message } = data; // ✅ username 추가
      
      try {
        // DB에 저장
        const savedMessage = await chatController.createChat(bookId, userId, message);
        
        console.log('💬 새 메시지 브로드캐스트:', {
          bookId,
          userId,
          username,
          message
        });
        
        // ✅ 룸의 모든 사용자에게 브로드캐스트 (전송자 포함)
        io.to(`book_${bookId}`).emit('receive_message', {
          bookId,
          userId,
          username: username, // ✅ username 포함
          nickname: username, // ✅ nickname도 추가
          message,
          created_at: new Date().toISOString()
        });
        
        // 또는 전송자 제외하고 브로드캐스트하려면:
        // socket.to(`book_${bookId}`).emit('receive_message', { ... });
        
      } catch (error) {
        logger.error('Error sending message:', error);
        // 에러 발생 시 전송자에게 알림
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };