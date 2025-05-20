
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var dotenv = require('dotenv');

dotenv.config();

const indexRoutes = require('./routes/index');
const bookRoutes = require('./routes/book');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);

const chatController = require('./controllers/chatController');
app.get('/api/books/:bookId/chat', chatController.getChatMessages);
app.post('/api/messages/:messageId/report', chatController.reportMessage);

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


module.exports = app;
