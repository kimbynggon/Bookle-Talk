const { Model } = require('sequelize'); // ✅ 수정된 부분

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      // 관계 정의 가능
      Like.belongsTo(models.User, { foreignKey: 'user_id' });
      Like.belongsTo(models.Book, { foreignKey: 'book_id' });
    }
  }

  Like.init(
    {
      user_id: DataTypes.INTEGER,
      book_id: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'likes',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'book_id']
        }
      ]
    }
  );

  return Like;
};
