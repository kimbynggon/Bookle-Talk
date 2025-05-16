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
    try {
        const result = await searchBooks(req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: '도서 검색 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;