
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var dotenv = require('dotenv');

dotenv.config();

const authRouter = require("./routes/auth");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var searchRouter = require('./routes/search');
// var bookRouter = require('./routes/book');

var app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/search', searchRouter);
// app.use('/api/books', bookRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('API 서버가 실행 중입니다.');
});

const db = require("./models");

db.sequelize
  .sync()
  .then(() => {
    console.log(" DB 연결 완료");
  })
  .catch((err) => {
    console.error(" DB 연결 실패:", err);
  });

module.exports = app;
