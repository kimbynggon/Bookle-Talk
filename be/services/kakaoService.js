const axios = require('axios');

const kakaoService = {
  async searchBooks(query) {
    try {
      const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
        },
        params: {
          query: query,
          size: 10
        }
      });
      return response.data.documents;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }
};

module.exports = kakaoService;
