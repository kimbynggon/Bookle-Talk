// be/services/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bookletalk',
  password: 'password', // 실제 비밀번호로 변경 필요
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};