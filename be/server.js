// server.js
const app = require('./app');

const PORT = process.env.PORT || 8080;

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});