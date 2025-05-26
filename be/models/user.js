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
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'cratedAt'  
    }
  }, {
    tableName: "Users",
    timestamps: true,     // createdAt을 자동 관리
    updatedAt: false,     // updatedAt 없음
    paranoid: false,
    underscored: false,   // 개별 field로 처리하므로 false여도 OK
  });

  User.associate = (models) => {
    User.hasMany(models.Chat, { foreignKey: 'user_id' });
    User.hasMany(models.Like, { foreignKey: 'user_id' });
    User.hasMany(models.Bookmark, { foreignKey: 'user_id' });
  };

  return User;
};
