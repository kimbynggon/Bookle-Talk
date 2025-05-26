const model = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false
    },
    book_id: {  
      type: DataTypes.INTEGER,
      references: {
        model: 'books',
        key: 'id'
      },
      allowNull: false
    },
    rating: {  // 별점 (1~5)
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    tableName: 'likes',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'book_id']
      }
    ]
  });

  Like.associate = function(models) {
    Like.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Like.belongsTo(models.Book, { 
      foreignKey: 'book_id',
      as: 'book'
    });
  };

  // Book 모델의 평점 계산 함수 호출
  Like.addHook('afterCreate', async (like) => {
    const Book = sequelize.models.Book;
    if (Book && Book.updateAverageRating) {
      await Book.updateAverageRating(like.book_id);
    }
  });

  Like.addHook('afterUpdate', async (like) => {
    const Book = sequelize.models.Book;
    if (Book && Book.updateAverageRating) {
      await Book.updateAverageRating(like.book_id);
    }
  });

  Like.addHook('afterDestroy', async (like) => {
    const Book = sequelize.models.Book;
    if (Book && Book.updateAverageRating) {
      await Book.updateAverageRating(like.book_id);
    }
  });

  Like.addHook('afterBulkCreate', async (likes) => {
    const Book = sequelize.models.Book;
    if (Book && Book.updateAverageRating) {
      const bookIds = [...new Set(likes.map(like => like.book_id))];
      for (const bookId of bookIds) {
        await Book.updateAverageRating(bookId);
      }
    }
  });

  return Like;
};