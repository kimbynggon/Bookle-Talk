module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
      user_id: {
        type: DataTypes.INTEGER,
      },
      book_id: {
        type: DataTypes.INTEGER,
      },
    }, {
      tableName: 'likes',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'book_id']
        }
      ]
    });
  
    return Like;
  };
  