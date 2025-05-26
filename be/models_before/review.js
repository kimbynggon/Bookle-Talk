module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reviews',
    timestamps: false,
    underscored: true
  });

  Review.associate = function(models) {
    // 리뷰와 사용자의 관계 (N:1)
    Review.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // 리뷰와 책의 관계 (N:1)
    Review.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book'
    });

    // 리뷰와 좋아요의 관계 (1:N)
    Review.hasMany(models.Like, {
      foreignKey: 'review_id',
      as: 'likes'
    });
  };

  return Review;
};
