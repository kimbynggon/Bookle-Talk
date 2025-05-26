const { Book, Like, sequelize } = require('../models');
const logger = require('../utils/logger');

// 모든 책 조회
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        {
          model: Like,
          as: 'likes',
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

// ID로 책 조회
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, {
      include: [
        {
          model: Like,
          as: 'likes',
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

// 책 생성
const createBook = async (req, res) => {
  try {
    const { title, authors, datetime, isbn, contents, thumbnail, price, translators } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const existingBook = await Book.findOne({ where: { title } });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book already exists'
      });
    }
    
    const book = await Book.create({
      title,
      authors,
      datetime,
      isbn,
      contents,
      thumbnail,
      price,
      translators,
      avg: 0.0
    });
    
    logger.info(`📝 새 책 생성: ${book.title}`);
    
    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    logger.error('Error creating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// 책 수정
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

// 책 삭제
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

// 책 검색
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
          { author: { [sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: Like,
          as: 'likes',
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

// 🆕 책 별점 주기
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

    const updatedBook = await Book.findByPk(bookId);

    logger.info(`⭐ 평점 ${created ? '등록' : '수정'}: 책 ${bookId}, 사용자 ${actualUserId}, 평점 ${rating}`);

    return res.status(200).json({
      success: true,
      message: `평점이 성공적으로 ${created ? '등록' : '수정'}되었습니다.`,
      data: { 
        bookId, 
        userId: actualUserId, 
        rating, 
        created,
        newAverageRating: updatedBook.avg 
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

// 🆕 사용자의 특정 책에 대한 별점 조회
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

// 🆕 사용자의 특정 책에 대한 별점 삭제
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
    
    const updatedBook = await Book.findByPk(bookId);
    
    logger.info(`🗑️ 사용자 별점 삭제: 책 ${bookId}, 사용자 ${actualUserId}`);
    
    return res.status(200).json({
      success: true,
      message: '별점이 성공적으로 삭제되었습니다.',
      data: {
        bookId: parseInt(bookId),
        userId: actualUserId,
        newAverageRating: updatedBook.avg
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

// 🆕 특정 책의 별점 통계 조회
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

// 🚀 모든 함수를 명시적으로 export
module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  rateBook,
  getUserRating,
  deleteUserRating,
  getBookRatingStats
};