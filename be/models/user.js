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
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false,  // timestamps를 false로 변경
    // createdAt과 updatedAt 설정 제거
    underscored: true
  });

  // 관계 설정 부분은 그대로 유지
  User.associate = function(models) {
    User.hasMany(models.Review, {
      foreignKey: 'user_id',
      as: 'reviews'
    });

    User.hasMany(models.Bookmark, {
      foreignKey: 'user_id',
      as: 'bookmarks'
    });

    User.hasMany(models.Like, {
      foreignKey: 'user_id',
      as: 'likes'
    });

    User.hasMany(models.Chat, {
      foreignKey: 'user_id',
      as: 'chats'
    });

    User.hasMany(models.ReviewComment, {
      foreignKey: 'user_id',
      as: 'comments'
    });
  };

  return User;
};