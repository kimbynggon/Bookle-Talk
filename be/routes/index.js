// be/routes/index.js
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Node.js 서버 연결 성공!'); // 간단한 텍스트 응답
});

module.exports = router;