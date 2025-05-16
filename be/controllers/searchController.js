// const axios = require('axios');
const searchService = require('../services/searchService');

/**
 * 도서 검색 컨트롤러
 */
exports.searchBooks = async (req, res, next) => {
  try {
    const { query, sort, page, size } = req.query;
    
    // 도서 검색 서비스 호출
    const result = await searchService.searchBooks(query, sort, page, size);
    
    // 클라이언트에 응답
    res.json(result);
  } catch (error) {
    console.error('도서 검색 오류:', error.message);
    next(error);
  }
};