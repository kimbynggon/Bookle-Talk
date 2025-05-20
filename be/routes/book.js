const express = require('express');
const axios = require('axios');
const router = express.Router();


const db = require('../services/db');
// API 키 확인용 로그
console.log('KAKAO API KEY:', process.env.KAKAO_API_KEY);

// 도서 검색 API 엔드포인트
router.get('/search', async (req, res) => {
  try {
    const { query, sort, page, size } = req.query;
    
    // KAKAO_API_KEY가 없으면 에러 반환
    if (!process.env.KAKAO_API_KEY) {
      return res.status(500).json({ 
        error: 'KAKAO API KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'
      });
    }
    
    // API 요청 파라미터 설정
    const params = {
      query: query || '',
      sort: sort || 'accuracy',
      page: page || 1,
      size: size || 10
    };
    
    // Kakao 도서 검색 API 호출
    const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
      },
      params
    });
    
    // 응답 데이터 전송
    res.json(response.data);
  } catch (error) {
    console.error('도서 검색 오류:', error);
    res.status(500).json({ 
      error: '도서 검색 중 오류가 발생했습니다',
      message: error.message 
    });
  }
});
// be/routes/book.js

// Get all books
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;