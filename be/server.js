const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const routes = require('./routes');
const { setupSocketIO } = require('./socket');

const PORT = process.env.PORT || 8080;

const app = express();
const cors = require('cors'); // 추가

// CORS 미들웨어 설정 추가
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  credentials: true,               // 쿠키 or 인증 정보 허용 시 true
}));

app.use(express.json()); // 필요 시 추가
app.use('/', routes);

const server = http.createServer(app);

// Initialize Socket.io with secure CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? "*" : "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.io handlers
setupSocketIO(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();