const express = require('express');
const router = express.Router();
const bookRoutes = require('./book');
const searchRoutes = require('./search');
const userRoutes = require('./users');
const chatController = require('../controllers/chatController');

//체팅 라우트 연결
router.get('/api/books/:bookId/chat', chatController.getChatsByBookId);
router.post('/api/books/:bookId/chat', chatController.sendMessage);



// API routes (채팅 라우트 다음에 배치)
router.use('/api/books', bookRoutes);
router.use('/api/search', searchRoutes);
router.use('/api/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      books: '/api/books',
      chat: '/api/books/:bookId/chat',
      search: '/api/search',
      users: '/api/users'
    }
  });
});

// Default route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bookle-Talk API 서버가 실행 중입니다.',
    version: '1.0.0',
    endpoints: {
      books: '/api/books',
      chat: '/api/books/:bookId/chat',
      search: '/api/search',
      users: '/api/users',
      health: '/health'
    }
  });
});

module.exports = router;