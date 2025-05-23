const { Chat, Book, User, sequelize } = require('../models_before');
const logger = require('../utils/logger');

exports.getChatsByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log('요청된 bookId:', bookId, typeof bookId);
    
    // 숫자로 변환 시도
    const numericBookId = parseInt(bookId, 10);
    console.log('숫자로 변환된 bookId:', numericBookId, typeof numericBookId);
    
    // 직접 SQL 쿼리 실행 - 데이터베이스에 실제로 데이터가 있는지 확인
    console.log('직접 SQL 쿼리 실행:');
    const rawBooks = await sequelize.query(
      'SELECT * FROM books WHERE id = :id',
      {
        replacements: { id: numericBookId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log('직접 SQL 쿼리 결과:', JSON.stringify(rawBooks, null, 2));
    
    // 테이블 이름 확인을 위한 쿼리
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('데이터베이스 테이블 목록:', tables);
    
    // 모델을 사용한 조회
    console.log('모델 정보:', Book.getTableName()); // 실제 테이블 이름 확인
    const book = await Book.findByPk(numericBookId);
    console.log('Sequelize 모델 결과:', book);
    
    // 직접 SQL 쿼리 결과가 있지만 모델 결과가 없는 경우 대체 처리
    if (!book && rawBooks && rawBooks.length > 0) {
      console.log('모델 결과는 null이지만 SQL 쿼리 결과가 있습니다. 대체 처리 시도...');
      
      // SQL 쿼리 결과를 사용하여 채팅 데이터 조회
      const rawChats = await sequelize.query(
        'SELECT c.*, u.id as user_id, u.username FROM chats c JOIN users u ON c.user_id = u.id WHERE c.book_id = :bookId ORDER BY c.created_at ASC',
        {
          replacements: { bookId: numericBookId },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      return res.status(200).json({
        success: true,
        data: rawChats,
        note: 'Data retrieved using direct SQL due to model discrepancy'
      });
    }
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        debug: {
          sqlResult: rawBooks, 
          modelName: Book.getTableName()
        }
      });
    }
    
    const chats = await Chat.findAll({
      where: { book_id: numericBookId },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('자세한 오류:', error);
    logger.error(`Error fetching chats:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// createChat과 sendMessage 함수는 변경 없음
exports.createChat = async (bookId, userId, message) => {
  try {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const chat = await Chat.create({
      book_id: bookId,
      user_id: userId,
      message
    });
    
    return chat;
  } catch (error) {
    logger.error('Error creating chat:', error);
    throw error;
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
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
    
    const newChat = await this.createChat(bookId, userId, message);
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newChat
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};