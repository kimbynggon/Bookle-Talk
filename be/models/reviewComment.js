module.exports = (sequelize, DataTypes) => {
  const ReviewComment = sequelize.define('ReviewComment', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'review_comments',
    timestamps: false,
    underscored: true
  });

  ReviewComment.associate = function(models) {
    // 댓글과 사용자의 관계 (N:1)
    ReviewComment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // 댓글과 리뷰의 관계 (N:1)
    ReviewComment.belongsTo(models.Review, {
      foreignKey: 'review_id',
      as: 'review'
    });
  };

  return ReviewComment;
};
