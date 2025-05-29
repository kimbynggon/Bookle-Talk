const logger = require('./utils/logger');
const chatController = require('./controllers/chatController');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join a book chat room
    socket.on('join_room', (bookId,callback) => {
      socket.join(`book_${bookId}`);
      logger.info(`User ${socket.id} joined room for book ${bookId}`);
      if (callback) callback();
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      const { bookId, userId, message } = data;
      
      try {
        await chatController.createChat(bookId, userId, message);
        
        // Broadcast to room
        io.to(`book_${bookId}`).emit('receive_message', {
          bookId,
          userId,
          message,
          created_at: new Date()
        });
      } catch (error) {
        logger.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };
