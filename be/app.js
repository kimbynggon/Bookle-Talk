var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var dotenv = require('dotenv');
dotenv.config();

// 라우터 import 정리
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const protectedRoutes = require('./routes/middleTest');

const FRONT_API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

var app = express();

// CORS 설정
app.use(cors({
  origin: FRONT_API,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// 미들웨어 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 연결
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/protected', protectedRoutes);

// 404 에러 처리
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// DB 연결
const db = require("./models");
db.sequelize
  .sync({alter: true})
  .then(() => {
    console.log("✅ DB 연결 완료");
  })
  .catch((err) => {
    console.error("❌ DB 연결 실패:", err);
  });

module.exports = app;