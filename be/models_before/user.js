module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
      "User",
      {
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
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "users",
        underscored: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
        paranoid: false,
      }
    );
  
    return User;
  };
  