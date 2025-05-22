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
    rating: {
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
    underscored: true  
  });

  Like.associate = function(models) {
    Like.belongsTo(models.User, { foreignKey: 'user_id' });
    Like.belongsTo(models.Book, { foreignKey: 'book_id' });
  };

  return Like;
};