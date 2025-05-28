const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const chatController = require('../controllers/chatController');

// 채팅 관련 라우트
router.get('/:bookId/chat', chatController.getChatsByBookId);   // 특정 책의 채팅 조회
router.post('/:bookId/chat', chatController.sendMessage);      // 채팅 메시지 전송

// 검색 관련 라우트
router.get('/search', bookController.searchBooks);              // 검색
router.get('/isbn/:isbn', bookController.getBookByIsbn);        // ISBN으로 책 조회

// 별점 관련 라우트
router.post('/rate', bookController.rateBook);                  // 별점 주기
router.get('/:bookId/user-rating', bookController.getUserRating); // 사용자 별점 조회
router.delete('/:bookId/rating', bookController.deleteUserRating); // 사용자 별점 삭제
router.get('/:bookId/rating-stats', bookController.getBookRatingStats); // 책 별점 통계

// CRUD 라우트
router.get('/', bookController.getAllBooks);                    // 모든 책 조회
router.get('/:id', bookController.getBookById);                 // 특정 책 조회
router.post('/', bookController.createBook);                    // 책 생성
router.put('/:id', bookController.updateBook);                  // 책 수정
router.delete('/:id', bookController.deleteBook);               // 책 삭제

module.exports = router;