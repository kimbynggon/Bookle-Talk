// ✅ models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    tableName: "Users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    paranoid: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Chat, { foreignKey: 'user_id' });
    User.hasMany(models.Like, { foreignKey: 'user_id' });
    User.hasMany(models.Bookmark, { foreignKey: 'user_id' });
  };

  return User;
};