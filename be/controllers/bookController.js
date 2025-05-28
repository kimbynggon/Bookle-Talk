const { Book, Like, User, sequelize } = require('../models');
const logger = require('../utils/logger');

// ISBN으로 책 조회 (완전히 수정된 버전)
const getBookByIsbn = async (req, res) => {
  try {
    const { isbn } = req.params;
    
    console.log(`🔍 ISBN 검색 요청: "${isbn}"`);
    
    if (!isbn || isbn.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ISBN is required'
      });
    }
    
    // ISBN 정리
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
    console.log(`🔧 정리된 ISBN: "${cleanIsbn}"`);
    
    // 여러 방식으로 책 검색 시도
    let book = null;
    
    // 1차: 정확한 일치 검색
    try {
      book = await Book.findOne({ 
        where: { isbn: cleanIsbn },
        include: [
          {
            model: Like,
            as: 'Likes',
            attributes: ['rating', 'user_id'],
            required: false
          }
        ]
      });
      
      if (book) {
        console.log(`✅ 정확한 일치로 책 발견: ${book.title}`);
      }
    } catch (error) {
      console.log('1차 검색 실패:', error.message);
    }
    
    // 2차: 원본 ISBN으로 검색 (공백 포함)
    if (!book && isbn !== cleanIsbn) {
      try {
        book = await Book.findOne({ 
          where: { isbn: isbn.trim() },
          include: [
            {
              model: Like,
              as: 'Likes',
              attributes: ['rating', 'user_id'],
              required: false
            }
          ]
        });
        
        if (book) {
          console.log(`✅ 원본 ISBN으로 책 발견: ${book.title}`);
        }
      } catch (error) {
        console.log('2차 검색 실패:', error.message);
      }
    }
    
    // 3차: 부분 일치 검색 (LIKE 대신 직접 SQL 사용)
    if (!book) {
      try {
        const searchPatterns = [
          cleanIsbn,
          isbn.split(' ')[0].trim(),
          isbn.trim()
        ];
        
        for (const pattern of searchPatterns) {
          if (pattern && pattern.length >= 10) { // ISBN은 최소 10자리
            book = await Book.findOne({
              where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('isbn')),
                'LIKE',
                `%${pattern.toLowerCase()}%`
              ),
              include: [
                {
                  model: Like,
                  as: 'likes',
                  attributes: ['rating', 'user_id'],
                  required: false
                }
              ]
            });
            
            if (book) {
              console.log(`✅ 패턴 검색으로 책 발견: ${book.title} (패턴: ${pattern})`);
              break;
            }
          }
        }
      } catch (error) {
        console.log('3차 검색 실패:', error.message);
      }
    }
    
    if (!book) {
      console.log(`❌ 모든 검색 방법으로 책을 찾지 못함: ${isbn}`);
      return res.status(404).json({
        success: false,
        message: 'Book not found with this ISBN',
        searched_isbn: cleanIsbn,
        original_isbn: isbn
      });
    }
    
    console.log(`✅ ISBN 검색 성공: ${book.title} (ID: ${book.id})`);
    
    return res.status(200).json({
      success: true,
      data: book
    });
    
  } catch (error) {
    console.error(`❌ ISBN 검색 중 오류 발생:`, error);
    logger.error(`Error fetching book with ISBN ${req.params.isbn}:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error while searching for book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      isbn: req.params.isbn
    });
  }
};

// 책 생성 (중복 처리 강화)
const createBook = async (req, res) => {
  try {
    const { title, authors, datetime, isbn, contents, thumbnail, price, translators, publisher } = req.body;
    
    console.log('📝 새 책 생성 요청:', { title, isbn, authors });
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // ISBN 정리
    const cleanIsbn = isbn ? isbn.replace(/[^0-9X]/gi, '').toUpperCase() : null;
    
    // 중복 체크 - 더 안전한 방법 사용
    if (cleanIsbn) {
      try {
        // 정확한 일치 검색
        let existingBook = await Book.findOne({ 
          where: { isbn: cleanIsbn }
        });
        
        // 원본 ISBN으로도 검색
        if (!existingBook && isbn !== cleanIsbn) {
          existingBook = await Book.findOne({ 
            where: { isbn: isbn.trim() }
          });
        }
        
        if (existingBook) {
          console.log(`⚠️ 이미 존재하는 책: ${existingBook.title} (ID: ${existingBook.id})`);
          return res.status(200).json({
            success: true,
            message: 'Book already exists',
            data: existingBook,
            already_exists: true
          });
        }
      } catch (error) {
        console.log('중복 체크 중 오류:', error.message);
      }
    } else {
      // ISBN이 없으면 제목으로 중복 체크
      try {
        const existingBook = await Book.findOne({ 
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('title')),
            sequelize.fn('LOWER', title.trim())
          )
        });
        
        if (existingBook) {
          console.log(`⚠️ 같은 제목의 책 존재: ${existingBook.title}`);
          return res.status(200).json({
            success: true,
            message: 'Book with similar title already exists',
            data: existingBook,
            already_exists: true
          });
        }
      } catch (error) {
        console.log('제목 중복 체크 중 오류:', error.message);
      }
    }
    
    // 새 책 생성
    const bookData = {
      title: title.trim(),
      authors: authors || '저자 미상',
      datetime,
      isbn: cleanIsbn,
      contents,
      thumbnail,
      price: parseInt(price) || 0,
      translators,
      publisher,
      avg: 0.0
    };
    
    const book = await Book.create(bookData);
    
    console.log(`✅ 새 책 생성 성공: ${book.title} (ID: ${book.id})`);
    
    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
    
  } catch (error) {
    console.error('❌ 책 생성 중 오류:', error);
    logger.error('Error creating book:', error);
    
    // Sequelize 유니크 제약 조건 위반 에러 처리
    if (error.name === 'SequelizeUniqueConstraintError') {
      try {
        const existingBook = await Book.findOne({ where: { isbn: req.body.isbn } });
        if (existingBook) {
          return res.status(200).json({
            success: true,
            message: 'Book already exists',
            data: existingBook,
            already_exists: true
          });
        }
      } catch (findError) {
        console.log('기존 책 찾기 실패:', findError.message);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 나머지 함수들은 기존과 동일 (getAllBooks, getBookById, updateBook, deleteBook, searchBooks, rateBook, getUserRating, deleteUserRating, getBookRatingStats)

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        {
          model: Like,
          as: 'Likes',
          attributes: [],
          required: false
        }
      ],
      attributes: {
        include: [[
          sequelize.fn('AVG', sequelize.col('likes.rating')),
          'averageRating'
        ]]
      },
      group: ['Book.id'],
      order: [['avg', 'DESC']]
    });
    
    logger.info(`📚 ${books.length}권의 책을 조회했습니다.`);
    
    return res.status(200).json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    logger.error('Error fetching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, {
      include: [
        {
          model: Like,
          as: 'Likes',
          attributes: ['rating', 'user_id']
        }
      ]
    });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    logger.info(`📖 책 조회: ${book.title} (ID: ${id})`);
    
    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    logger.error(`Error fetching book with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    await book.update(updateData);
    
    logger.info(`✏️ 책 수정: ${book.title} (ID: ${id})`);
    
    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    logger.error(`Error updating book with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    await book.destroy();
    
    logger.info(`🗑️ 책 삭제: ID ${id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting book with id ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const localBooks = await Book.findAll({
      where: {
        [sequelize.Op.or]: [
          { title: { [sequelize.Op.iLike]: `%${query}%` } },
          { authors: { [sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: Like,
          as: 'Likes',
          attributes: ['rating'],
          required: false
        }
      ],
      order: [['avg', 'DESC']]
    });

    logger.info(`🔍 검색 실행: "${query}" - ${localBooks.length}권 발견`);

    return res.status(200).json({
      success: true,
      data: {
        local: localBooks,
        kakao: []
      },
      count: {
        local: localBooks.length,
        kakao: 0
      },
      query: query
    });
  } catch (error) {
    logger.error('Error searching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search books',
      error: error.message
    });
  }
};

const rateBook = async (req, res) => {
  try {
    const { bookId, rating, userId } = req.body;
    
    const actualUserId = req.user?.userId || userId;

    if (!bookId || !rating || !actualUserId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID, user ID, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const [like, created] = await Like.upsert({
      user_id: actualUserId,
      book_id: bookId,
      rating
    });

    // 평균 별점 업데이트
    const avgResult = await Like.findAll({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });

    const newAvg = parseFloat(avgResult[0].avgRating).toFixed(2);
    await book.update({ avg: newAvg });

    logger.info(`⭐ 평점 ${created ? '등록' : '수정'}: 책 ${bookId}, 사용자 ${actualUserId}, 평점 ${rating}`);

    return res.status(200).json({
      success: true,
      message: `평점이 성공적으로 ${created ? '등록' : '수정'}되었습니다.`,
      data: { 
        bookId, 
        userId: actualUserId, 
        rating, 
        created,
        newAverageRating: newAvg 
      }
    });
  } catch (error) {
    logger.error('Error rating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rate book',
      error: error.message
    });
  }
};

const getUserRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.query;
    
    const actualUserId = req.user?.userId || userId;
    
    if (!actualUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const like = await Like.findOne({
      where: {
        user_id: actualUserId,
        book_id: bookId
      }
    });
    
    if (!like) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No rating found for this user and book'
      });
    }
    
    logger.info(`🔍 사용자 별점 조회: 책 ${bookId}, 사용자 ${actualUserId}, 별점 ${like.rating}`);
    
    return res.status(200).json({
      success: true,
      data: {
        bookId: parseInt(bookId),
        userId: actualUserId,
        rating: like.rating,
        id: like.id
      }
    });
  } catch (error) {
    logger.error('Error fetching user rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user rating',
      error: error.message
    });
  }
};

const deleteUserRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.body;
    
    const actualUserId = req.user?.userId || userId;
    
    if (!actualUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const like = await Like.findOne({
      where: {
        user_id: actualUserId,
        book_id: bookId
      }
    });
    
    if (!like) {
      return res.status(404).json({
        success: false,
        message: 'No rating found to delete'
      });
    }
    
    await like.destroy();
    
    // 평균 별점 재계산
    const avgResult = await Like.findAll({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });

    const newAvg = avgResult[0].avgRating ? parseFloat(avgResult[0].avgRating).toFixed(2) : 0.0;
    await book.update({ avg: newAvg });
    
    logger.info(`🗑️ 사용자 별점 삭제: 책 ${bookId}, 사용자 ${actualUserId}`);
    
    return res.status(200).json({
      success: true,
      message: '별점이 성공적으로 삭제되었습니다.',
      data: {
        bookId: parseInt(bookId),
        userId: actualUserId,
        newAverageRating: newAvg
      }
    });
  } catch (error) {
    logger.error('Error deleting user rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user rating',
      error: error.message
    });
  }
};

const getBookRatingStats = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const ratingStats = await Like.findAll({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('rating')), 'total_count'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        [sequelize.fn('MIN', sequelize.col('rating')), 'min_rating'],
        [sequelize.fn('MAX', sequelize.col('rating')), 'max_rating']
      ],
      raw: true
    });

    const ratingDistribution = await Like.findAll({
      where: { book_id: bookId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });
    
    const stats = ratingStats[0];
    
    logger.info(`📊 책 ${bookId}의 별점 통계 조회`);
    
    return res.status(200).json({
      success: true,
      data: {
        book_id: parseInt(bookId),
        book_title: book.title,
        current_avg: book.avg,
        total_ratings: parseInt(stats.total_count) || 0,
        calculated_avg: stats.average ? parseFloat(stats.average).toFixed(2) : 0.0,
        min_rating: stats.min_rating || 0,
        max_rating: stats.max_rating || 0,
        rating_distribution: ratingDistribution
      }
    });
  } catch (error) {
    logger.error('Error fetching book rating stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch book rating statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  rateBook,
  getUserRating,
  deleteUserRating,
  getBookRatingStats
};