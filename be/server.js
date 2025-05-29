const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const routes = require('./routes');
const { setupSocketIO } = require('./socket');
const os = require('os');

const PORT = process.env.PORT || 8080;

// 네트워크 인터페이스에서 로컬 IP 주소 가져오기
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
};

const LOCAL_IP = getLocalIP();
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  `http://${LOCAL_IP}:3000`,
  `http://${LOCAL_IP}:3001`,
  process.env.REACT_APP_API_URL
].filter(Boolean);

const app = express();
const cors = require('cors');

// 개선된 CORS 미들웨어 설정
app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우 (모바일 앱, Postman 등) 허용
    if (!origin) return callback(null, true);
    
    // 개발 환경에서는 모든 localhost와 로컬 IP 허용
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes(LOCAL_IP)) {
        return callback(null, true);
      }
    }
    
    // 허용된 origin 목록 확인
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    logger.warn(`CORS: Origin ${origin} not allowed`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// IP 주소 로깅 미들웨어
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  logger.info(`Request from IP: ${clientIP} to ${req.method} ${req.path}`);
  next();
});

app.use('/', routes);

const server = http.createServer(app);

// 개선된 Socket.io 설정
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // origin이 없는 경우 허용
      if (!origin) return callback(null, true);
      
      // 개발 환경에서는 모든 localhost와 로컬 IP 허용
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes(LOCAL_IP)) {
          return callback(null, true);
        }
      }
      
      // 허용된 origin 목록 확인
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      
      logger.warn(`Socket.io CORS: Origin ${origin} not allowed`);
      callback(null, false);
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  // 추가 설정
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    logger.info(`Socket.io connection attempt from: ${origin || 'unknown'}`);
    callback(null, true);
  }
});

// Setup Socket.io handlers
setupSocketIO(io);

// Socket.io 연결 모니터링
io.engine.on("connection_error", (err) => {
  logger.error("Socket.io connection error:", {
    message: err.message,
    type: err.type,
    description: err.description
  });
});

io.on("connection", (socket) => {
  const clientIP = socket.handshake.address;
  logger.info(`Socket connected from IP: ${clientIP}, Socket ID: ${socket.id}`);
  
  socket.on("disconnect", (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    
    // 모든 네트워크 인터페이스에 바인딩 (0.0.0.0)
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📱 Local access: http://localhost:${PORT}`);
      logger.info(`🌐 Network access: http://${LOCAL_IP}:${PORT}`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ Allowed origins:`, ALLOWED_ORIGINS);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

// Start the server
startServer();