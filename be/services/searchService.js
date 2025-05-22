// services/searchService.js
const axios = require('axios');
require('dotenv').config();

/**
 * 도서 검색 서비스
 * @param {Object} params - 검색 매개변수
 * @param {string} params.query - 검색어
 * @param {string} params.sort - 정렬 기준
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @returns {Promise<Object>} - 검색 결과
 */
const searchBooks = async (params) => {
  try {
    const { query, sort = 'accuracy', page = 1, size = 10 } = params;
    
    const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
      },
      params: {
        query,
        sort,
        page,
        size
      }
    });

    return response.data;
  } catch (error) {
    console.error('도서 검색 오류:', error);
    throw error;
  }
};

module.exports = {
  searchBooks
};