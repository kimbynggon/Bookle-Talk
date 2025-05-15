// const axios = require('axios');

/**
 * 카카오 도서 검색 API를 사용하여 도서 검색
 * @param {string} query - 검색어
 * @param {string} sort - 정렬 방식 (accuracy: 정확도, latest: 최신순)
 * @param {number} page - 페이지 번호
 * @param {number} size - 한 페이지에 보여질 문서 수
 * @returns {Promise<Object>} 검색 결과
 */
exports.searchBooks = async (query, sort = 'accuracy', page = 1, size = 10) => {
  try {
    // 파라미터 유효성 검사
    if (!query) {
      throw new Error('검색어는 필수입니다');
    }
    
    // 카카오 도서 검색 API 호출
    const response = await axios.get("https://dapi.kakao.com/v3/search/book?target=title", {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`
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
    // 에러 처리
    if (error.response) {
      // 카카오 API로부터 받은 에러 응답
      throw new Error(`카카오 API 오류: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`);
    } else if (error.request) {
      // 응답을 받지 못한 경우
      throw new Error('카카오 API에 연결할 수 없습니다');
    } else {
      // 요청 설정 중 오류 발생
      throw error;
    }
  }
};