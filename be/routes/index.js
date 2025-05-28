// routes/index.js 수정 (중복 라우트 제거)
const express = require('express');
const router = express.Router();
const bookRoutes = require('./book');
const searchRoutes = require('./search');
const userRoutes = require('./users');
const authRoutes = require('./auth');

// 인증 라우트
router.use('/api/auth', authRoutes);

// API 라우트
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
      search: '/api/search',
      users: '/api/users',
      auth: '/api/auth'
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
      search: '/api/search',
      users: '/api/users',
      auth: '/api/auth',
      health: '/health'
    }
  });
});

module.exports = router;