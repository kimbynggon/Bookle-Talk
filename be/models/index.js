<<<<<<< HEAD
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/db');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.db,
  config.user,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: msg => logger.debug(msg),
    pool: config.pool
  }
);

const db = {
  sequelize,
  Sequelize,
  User: null,
  Review: null,
  Like: null,
  Bookmark: null,
  Chat: null
};

// Import models in dependency order
const models = [
  'user',  // 기본 사용자 모델
  'book',   // 책 모델
  'review', // 리뷰 모델
  'reviewComment', // 리뷰 댓글 모델
  'like',   // 좋아요 모델
  'bookmark', // 북마크 모델
  'chat'    // 채팅 모델
];

// First load models without associations
try {
  models.forEach(modelName => {
    const model = require(path.join(__dirname, `${modelName}.js`))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });
} catch (error) {
  logger.error('Failed to load models:', error);
  process.exit(1);
}

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// Test database connection 부분 위에 추가
console.log('현재 데이터베이스 연결 설정:', {
  database: config.db,
  username: config.user,
  host: config.host,
  port: config.port,
  dialect: config.dialect
});
// Test database connection
try {
  sequelize.authenticate()
    .then(() => {
      logger.info('Database connection has been established successfully.');
    })
    .catch(err => {
      logger.error('Unable to connect to the database:', err);
      process.exit(1);
    });
} catch (error) {
  logger.error('Database connection test failed:', error);
  process.exit(1);
}

module.exports = db;
=======
const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config(); 
const db = {};

const sequelize = new Sequelize(
  process.env.DB_DATABASE,      
  process.env.DB_ID,            
  process.env.DB_PASS,          
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT, 
    logging: false,
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);

module.exports = db;
>>>>>>> f7eb54460ddd3cf2fca94aba2a04d6a2d4f9c007
