// routes/books.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @route   GET /api/books
 * @desc    도서 검색
 * @access  Public
 */
router.get('/', searchController.searchBooks);

module.exports = router;