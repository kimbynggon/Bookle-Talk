const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/book/:bookId', chatController.getChatsByBookId);
router.post('/book/:bookId/message', chatController.sendMessage);

module.exports = router;