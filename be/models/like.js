// models/like.model.js
module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
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
      review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'reviews',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'likes',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'review_id']
        }
      ]
    });
  
    Like.associate = function(models) {
      // 좋아요와 사용자의 관계 (N:1)
      Like.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
  
      // 좋아요와 리뷰의 관계 (N:1)
      Like.belongsTo(models.Review, {
        foreignKey: 'review_id',
        as: 'review'
      });
    };
  
    return Like;
  };