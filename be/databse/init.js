// database/init.js - 데이터베이스 초기화 및 테이블 생성

const { Pool } = require('pg');
const dbConfig = require('../config/db.config');

// PostgreSQL 연결 풀 생성
const pool = new Pool(dbConfig);

// 데이터베이스 초기화 함수
async function initDb() {
  const client = await pool.connect();
  
  try {
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    // users 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // books 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100),
        published_year INT,
        isbn VARCHAR(20),
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // reviews 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        rating INT,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // likes 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        review_id INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_id)
      )
    `);
    
    // review_comments 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS review_comments (
        id SERIAL PRIMARY KEY,
        review_id INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INT REFERENCES review_comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // bookmarks 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);
    
    // chats 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 인덱스 생성
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chats_book_id ON chats(book_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id)');
    
    // 트랜잭션 커밋
    await client.query('COMMIT');
    
    console.log('데이터베이스 테이블이 성공적으로 생성되었습니다.');
  } catch (err) {
    // 오류 발생시 롤백
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // 클라이언트 반환
    client.release();
  }
}

// Pool 및 초기화 함수 내보내기
module.exports = {
  pool,
  initDb
};