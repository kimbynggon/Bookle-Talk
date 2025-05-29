const axios = require('axios');
const { Book } = require('../models/index');
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

// 별점 평균 가져오는 함수 (isbn 기준)
const getAverageRating = async (isbn) => {
  const book = await Book.findOne({ where: { isbn } });
  if (!book || book.avg == null) return null;
  return (Number(book.avg).toFixed(1));
};

const searchBooks = async (params) => {
  try {
    // 쿼리 파라미터에서 검색어와 페이지 정보 가져오기
    const query = params.query;
    const page = params.page || 1; // 기본값 설정
    const size = params.size || 10;
    const sort = params.sort || 'accuracy'

    // Kakao API에서 지원하는 정렬 기준만 전달
    const kakaoSort = (sort === 'accuracy') ? sort : 'accuracy';

    const response = await axios.get('https://dapi.kakao.com/v3/search/book?target=title', {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
      params: { 
        query, 
        sort: kakaoSort, 
        page, 
        size 
      },
    });

    let books = response.data.documents;

    // 각 도서에 평균 별점(avg) 추가
    books = await Promise.all(
      books.map(async (book) => {
        const isbn = book.isbn?.split(' ')[0]; // ISBN 정리
        const avg = await getAverageRating(isbn);

        return {
          ...book,
          isbn,
          avg,
        };
      })
    );

    // API 응답 후 추가 정렬 처리
    switch (sort) {
      case 'price_desc':
        books.sort((a, b) => b.price - a.price);
        break;
      case 'price_asc':
        books.sort((a, b) => a.price - b.price);
        break;
      case 'title_asc':
        books.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        books.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating':
        books.sort((a, b) => b.avg - a.avg);
        break;
      default:
        break;
    }

    // DB 저장
    for (const book of books) {
      const isbn = book.isbn?.split(' ')[0]; // ISBN 중복 방지용

      // 이미 존재하는 책은 저장 안함
      const existing = await Book.findOne({ where: { isbn } });
      if (!existing) {
        await Book.create({
          title: book.title,
          authors: book.authors.join(', '),
          thumbnail: book.thumbnail,
          datetime: book.datetime,
          isbn,
          price: book.price,
          translators: book.translators?.join(', '),
          contents: book.contents,
          publisher: book.publisher,
          url: book.url,
        });
      }
    }

    // 페이지네이션 정보 포함해서 리턴
    return {
      ...response.data,
      documents: books,
    };

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