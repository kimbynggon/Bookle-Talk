const express = require('express');
const router = express.Router();
const bookRoutes = require('./book');
const searchRoutes = require('./search');
const userRoutes = require('./users');
const authRoutes = require('./auth'); 
const chatController = require('../controllers/chatController');

// API routes
router.use('/api/books', bookRoutes);
router.use('/api/search', searchRoutes);
router.use('/api/users', userRoutes);


router.use('/api/auth', authRoutes);  

// Chat routes
router.get('/api/books/:bookId/chat', (req, res) => {
  chatController.getChatsByBookId(req, res);
});
// router.post('/api/messages/:messageId/report', (req, res) => {
//   chatController.reportMessage(req, res);
// });
router.post('/api/books/:bookId/chat', (req, res) => {
  chatController.sendMessage(req, res);
});

// Default route
router.get('/', (req, res) => {
  res.send('API 서버가 실행 중입니다.');
});

module.exports = router;
