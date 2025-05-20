// be/controllers/chatController.js
const db = require('../services/db');
const { Server } = require('socket.io');

let io;

// Initialize socket.io
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a book chat room
    socket.on('join_book', (bookId) => {
      socket.join(`book_${bookId}`);
      console.log(`User ${socket.id} joined book_${bookId}`);
    });

    // Listen for new messages
    socket.on('send_message', async (messageData) => {
      try {
        const { bookId, userId, username, rating, comment } = messageData;
        
        // Save message to database
        const result = await db.query(
          'INSERT INTO chat_messages (book_id, user_id, username, rating, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
          [bookId, userId, username, rating, comment]
        );

        const savedMessage = result.rows[0];
        
        // Broadcast the message to everyone in the book room
        io.to(`book_${bookId}`).emit('receive_message', savedMessage);
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Get chat messages for a specific book
const getChatMessages = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const result = await db.query(
      'SELECT * FROM chat_messages WHERE book_id = $1 ORDER BY created_at ASC',
      [bookId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Report a message
const reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reason } = req.body;
    
    await db.query(
      'INSERT INTO message_reports (message_id, user_id, reason, reported_at) VALUES ($1, $2, $3, NOW())',
      [messageId, userId, reason]
    );
    
    res.status(201).json({ message: 'Message reported successfully' });
  } catch (error) {
    console.error('Error reporting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  initializeSocket,
  getChatMessages,
  reportMessage
};