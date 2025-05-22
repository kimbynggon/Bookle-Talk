module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true
    },
    published_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'books',
    timestamps: false
  });

  Book.associate = function(models) {
    Book.hasMany(models.Chat, { foreignKey: 'book_id' });
    Book.hasMany(models.Like, { foreignKey: 'book_id' });
    // Commented out as the user mentioned these are handled by someone else
    // Book.hasMany(models.Review, { foreignKey: 'book_id' });
    // Book.hasMany(models.Bookmark, { foreignKey: 'book_id' });
  };

  return Book;
};