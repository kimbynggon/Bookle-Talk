// ✅ models/bookmark.js
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      Bookmark.belongsTo(models.User, { foreignKey: 'user_id' });
      Bookmark.belongsTo(models.Book, { foreignKey: 'book_id' });
    }
  }
  Bookmark.init({
    user_id: DataTypes.INTEGER,
    book_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bookmark',
    tableName: 'Bookmarks'
  });
  return Bookmark;
};