// models/user.model.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'users',
      timestamps: false,
      underscored: true
    });
  
    User.associate = function(models) {
      // 사용자와 리뷰의 관계 (1:N)
      User.hasMany(models.Review, {
        foreignKey: 'user_id',
        as: 'reviews'
      });
  
      // 사용자와 북마크의 관계 (1:N)
      User.hasMany(models.Bookmark, {
        foreignKey: 'user_id',
        as: 'bookmarks'
      });
  
      // 사용자와 좋아요의 관계 (1:N)
      User.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes'
      });
  
      // 사용자와 채팅의 관계 (1:N)
      User.hasMany(models.Chat, {
        foreignKey: 'user_id',
        as: 'chats'
      });
  
      // 사용자와 리뷰 댓글의 관계 (1:N)
      User.hasMany(models.ReviewComment, {
        foreignKey: 'user_id',
        as: 'comments'
      });
    };
  
    return User;
  };