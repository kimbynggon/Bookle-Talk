const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 모델 등록
db.User = require('./user')(sequelize, Sequelize);
db.Book = require('./book')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.Like = require('./like')(sequelize, Sequelize);
db.Bookmark = require('./bookmark')(sequelize, Sequelize);
db.ReviewComment = require('./review_comment')(sequelize, Sequelize);
db.Chat = require('./chat')(sequelize, Sequelize);

// 관계 설정

// User - Review 관계
db.User.hasMany(db.Review, { foreignKey: 'user_id' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id' });

// Book - Review 관계
db.Book.hasMany(db.Review, { foreignKey: 'book_id' });
db.Review.belongsTo(db.Book, { foreignKey: 'book_id' });

// User - Like 관계
db.User.hasMany(db.Like, { foreignKey: 'user_id' });
db.Like.belongsTo(db.User, { foreignKey: 'user_id' });

// Review - Like 관계
db.Review.hasMany(db.Like, { foreignKey: 'review_id' });
db.Like.belongsTo(db.Review, { foreignKey: 'review_id' });

// User - Bookmark 관계
db.User.hasMany(db.Bookmark, { foreignKey: 'user_id' });
db.Bookmark.belongsTo(db.User, { foreignKey: 'user_id' });

// Book - Bookmark 관계
db.Book.hasMany(db.Bookmark, { foreignKey: 'book_id' });
db.Bookmark.belongsTo(db.Book, { foreignKey: 'book_id' });

// User - ReviewComment 관계
db.User.hasMany(db.ReviewComment, { foreignKey: 'user_id' });
db.ReviewComment.belongsTo(db.User, { foreignKey: 'user_id' });

// Review - ReviewComment 관계
db.Review.hasMany(db.ReviewComment, { foreignKey: 'review_id' });
db.ReviewComment.belongsTo(db.Review, { foreignKey: 'review_id' });

// ReviewComment - ReviewComment (self-reference for parent/child) 관계
db.ReviewComment.hasMany(db.ReviewComment, { foreignKey: 'parent_id', as: 'Replies' });
db.ReviewComment.belongsTo(db.ReviewComment, { foreignKey: 'parent_id', as: 'Parent' });

// User - Chat 관계
db.User.hasMany(db.Chat, { foreignKey: 'user_id' });
db.Chat.belongsTo(db.User, { foreignKey: 'user_id' });

// Book - Chat 관계
db.Book.hasMany(db.Chat, { foreignKey: 'book_id' });
db.Chat.belongsTo(db.Book, { foreignKey: 'book_id' });

// 데이터베이스 연결 테스트
sequelize.authenticate()
  .then(() => {
    logger.info('데이터베이스 연결에 성공했습니다.');
  })
  .catch(err => {
    logger.error('데이터베이스 연결에 실패했습니다:', err);
  });

module.exports = db;