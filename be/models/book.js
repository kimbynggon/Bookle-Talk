// ✅ models/book.js
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.hasMany(models.Chat, { foreignKey: 'book_id' });
      Book.hasMany(models.Like, { foreignKey: 'book_id' });
      Book.hasMany(models.Bookmark, { foreignKey: 'book_id' });
    }
  }
  Book.init({
    title: DataTypes.STRING,
    authors: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    datetime: DataTypes.STRING,
    publisher: DataTypes.STRING,
    isbn: DataTypes.STRING,
    price: DataTypes.INTEGER,
    translators: DataTypes.STRING,
    contents: DataTypes.TEXT,
    url: DataTypes.TEXT,
    avg: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.0,
      validate: { min: 0.0, max: 5.0 }
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'Books',
    timestamps: false
  });
  return Book;
};
