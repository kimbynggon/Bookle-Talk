module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
      },
      published_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
      },
      translator: {
        type: DataTypes.STRING,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      tableName: 'books',
      underscored: true,
      timestamps: true,
      paranoid: true,
    });
  
    return Book;
  };
  
