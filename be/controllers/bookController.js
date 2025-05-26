const { Book, Like } = require('../models');
const logger = require('../utils/logger');
const kakaoService = require('../services/kakaoService');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        {
          model: Like,
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
      group: ['Book.id']
    });
    return res.status(200).json({
      success: true,
      data: books
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

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
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

exports.createBook = async (req, res) => {
  try {
    const { title, authors, datetime, isbn, contents } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Search for existing book
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
      contents
    });
    
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

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, datetime, isbn, contents } = req.body;
    
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    await book.update({
      title: title || book.title,
      authors: authors || book.authors,
      datetime: datetime || book.datetime,
      isbn: isbn || book.isbn,
      contents: contents || book.contents
    });
    
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

exports.deleteBook = async (req, res) => {
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

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const kakaoBooks = await kakaoService.searchBooks(query);
    
    // Save books to database if they don't exist
    const booksToCreate = kakaoBooks.map(book => ({
      title: book.title,
      authors: book.authors?.[0],
      datetime: book.datetime ? new Date(book.datetime).getFullYear() : null,
      isbn: book.isbn,
      contents: book.contents
    }));

    // Create books that don't exist in the database
    const existingTitles = await Book.findAll({ attributes: ['title'] });
    const existingTitlesSet = new Set(existingTitles.map(b => b.title));
    
    const newBooks = booksToCreate.filter(book => !existingTitlesSet.has(book.title));
    if (newBooks.length > 0) {
      await Book.bulkCreate(newBooks);
    }

    return res.status(200).json({
      success: true,
      data: kakaoBooks
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

exports.rateBook = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const { userId } = req.user; // Assuming user is authenticated

    if (!bookId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and rating are required'
      });
    }

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update or create like
    const like = await Like.upsert({
      userId: userId,
      bookId: bookId,
      rating
    });

    return res.status(200).json({
      success: true,
      data: like
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