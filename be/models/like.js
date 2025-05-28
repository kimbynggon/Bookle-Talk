// models/like.js
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.STRING, 
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      } 
    },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
  }, {
    tableName: 'Likes',
    timestamps: false,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'book_id'] }]
  });
  Like.associate = function(models) {
    Like.belongsTo(models.User, { 
      foreignKey: 'user_id',
      targetKey: 'user_id' 
    });
    Like.belongsTo(models.Book, { 
      foreignKey: 'book_id',
      as: 'book'  
    });
  };

  return Like;
};