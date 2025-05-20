// models/book.model.js
module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      author: {
        type: DataTypes.STRING(255)
      },
      published_year: {
        type: DataTypes.INTEGER
      },
      isbn: {
        type: DataTypes.STRING(20)
      },
      summary: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'books',
      timestamps: false,
      underscored: true
    });
  
    Book.associate = function(models) {
      // 도서와 리뷰의 관계 (1:N)
      Book.hasMany(models.Review, {
        foreignKey: 'book_id',
        as: 'reviews'
      });
  
      // 도서와 북마크의 관계 (1:N)
      Book.hasMany(models.Bookmark, {
        foreignKey: 'book_id',
        as: 'bookmarks'
      });
  
      // 도서와 채팅의 관계 (1:N)
      Book.hasMany(models.Chat, {
        foreignKey: 'book_id',
        as: 'chats'
      });
    };
  
    return Book;
  };