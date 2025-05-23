module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'bookmarks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'book_id']
      }
    ]
  });

  Bookmark.associate = function(models) {
    // 북마크와 사용자의 관계 (N:1)
    Bookmark.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // 북마크와 책의 관계 (N:1)
    Bookmark.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book'
    });
  };

  return Bookmark;
};
