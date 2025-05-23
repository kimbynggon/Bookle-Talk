// services/searchService.js
const axios = require('axios');
require('dotenv').config();

/**
 * 도서 검색 서비스
 * @param {Object} params - 검색 매개변수
 * @param {string} params.query - 검색어
 * @param {string} params.sort - 정렬 기준
 * @param {number} params.page - 페이지 번호
//  * @param {number} params.size - 페이지 크기
 * @returns {Promise<Object>} - 검색 결과
 */
const searchBooks = async (params) => {
  try {
    // 쿼리 파라미터에서 검색어와 페이지 정보 가져오기
    const query = params.query;
    const page = params.page || 1; // 기본값 설정
    
    const response = await axios.get('https://dapi.kakao.com/v3/search/book?target=title', {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
      },
      params: {
        query,
        // sort,
        page,
        // size,
        target: 'title'
      }
    });
    // console.log(response.data);
    return response.data;

  } catch (error) {
    console.error(error.response?.data || error.message)
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || '카카오 API 요청 중 오류가 발생했습니다.',
    };
  }        
};

module.exports = {
  searchBooks
};