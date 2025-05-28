module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
      field: 'createdAt'  
    }
  }, {
    tableName: "Users",
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    underscored: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Chat, { 
      foreignKey: 'user_id', 
      sourceKey: 'user_id', 
      as: 'chats' 
    });
    User.hasMany(models.Like, { 
      foreignKey: 'user_id', 
      sourceKey: 'user_id', 
      as: 'likes' 
    });
  };

  return User;
};