var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var dotenv = require('dotenv');
dotenv.config();
const authRouter = require("./routes/auth");
const protectedRouter = require("./routes/middleTest"); 

const routes = require('./routes');
// const logger = require('./utils/logger');
const indexRoutes = require('./routes/index');
const bookRoutes = require('./routes/book');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');


const express = require('express');
const cors = require('cors');
const FRONT_API = process.env.REACT_APP_API_URL

var app = express();

app.use(cors({
  origin: FRONT_API,  // 프론트엔드 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use("/api/user", usersRouter); 


app.use(express.json());
app.use("/api/auth", authRouter);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRoutes);
app.use('/api/books', book);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

app.use('/api', routes);
const chatController = require('./controllers/chatController');
app.get('/api/books/:bookId/chat', chatController.getChatMessages);
app.post('/api/messages/:messageId/report', chatController.reportMessage);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/search', searchRouter);
// app.use('/api/books', bookRouter);
app.use("/api/user/protected", protectedRouter);

// error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('API 서버가 실행 중입니다.');
});

app.use(function(req, res, next) {
  next(createError(404));
});

const db = require("./models");

db.sequelize
  .sync({alter: true}) // model정보에 맞춰서 임시로 컬럼 추가되는 코드 {alter: true}
  .then(() => {
    console.log(" DB 연결 완료");
  })
  .catch((err) => {
    console.error(" DB 연결 실패:", err);
  });


module.exports = app;