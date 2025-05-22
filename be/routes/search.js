// routes/search.js
const express = require('express');
const router = express.Router();
const { searchBooks } = require('../services/searchService');
/**
 * @route   GET /api/books
 * @desc    도서 검색
 * @access  Public
 */
router.get('/', async (req, res) => {
    console.log('검색 파라미터:', req.query); // 로그 추가
    try {
        // 쿼리 파라미터 검증 추가
        if (!req.query.query) {
            return res.status(400).json({
                message: '검색어가 필요합니다.'
            });
        }
        
        const result = await searchBooks(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error('검색 에러 상세:', error); // 자세한 에러 로그
        return res.status(error.statusCode || 500).json({
            message: '도서 검색 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;