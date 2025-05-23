'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    image: DataTypes.STRING,
    published_year: DataTypes.INTEGER,
    isbn: DataTypes.STRING,
    price: DataTypes.INTEGER,
    translator: DataTypes.STRING,
    summary: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};