const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const routes = require('./routes');
const { setupSocketIO } = require('./socket');
const os = require('os');
const cors = require('cors');

const PORT = process.env.PORT || 8080;

// 1. 로컬 IP 탐색 함수
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return iface.address;
    }
  }
  return 'localhost';
};

const LOCAL_IP = getLocalIP();

// 2. 허용된 Origin 리스트
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  `http://${LOCAL_IP}:3000`,
  `http://${LOCAL_IP}:3001`,
  process.env.REACT_APP_API_URL
].filter(Boolean);

const app = express();

// 3. CORS 설정
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes(LOCAL_IP)) {
      return callback(null, true);
    }
    logger.warn(`❌ CORS 차단: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 4. 요청 로그
app.use((req, res, next) => {
  logger.info(`📥 Request: ${req.ip} ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/', routes);

// 5. HTTP 서버 생성 및 Socket.IO 설정
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes(LOCAL_IP)) {
        return callback(null, true);
      }
      logger.warn(`❌ Socket.IO CORS 차단: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// 6. 소켓 이벤트 등록
setupSocketIO(io);

// 7. 연결 에러 로깅
io.engine.on('connection_error', (err) => {
  logger.error('❌ Socket.IO 연결 에러:', {
    message: err.message,
    type: err.type,
    description: err.description
  });
});

// 8. 연결/종료 로깅
io.on('connection', (socket) => {
  logger.info(`🔌 Socket 연결됨: ${socket.id} (IP: ${socket.handshake.address})`);
  socket.on('disconnect', (reason) => {
    logger.info(`❌ Socket 연결 종료: ${socket.id} - 이유: ${reason}`);
  });
});

// 9. 에러 핸들러
app.use((err, req, res, next) => {
  logger.error('서버 에러:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 10. 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 11. 서버 실행
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 서버 실행: http://localhost:${PORT}`);
      logger.info(`🌐 네트워크 접근: http://${LOCAL_IP}:${PORT}`);
      logger.info(`✅ 허용된 Origins: ${ALLOWED_ORIGINS.join(', ')}`);
      logger.info(`🔧 실행 환경: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('❌ 서버 실행 실패:', err);
    process.exit(1);
  }
};

// 12. 종료 처리
process.on('SIGINT', () => {
  logger.info('🛑 SIGINT 수신: 서버 종료 중...');
  server.close(() => logger.info('🔚 서버 종료 완료'));
  process.exit(0);
});

startServer();
