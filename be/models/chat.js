module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      book_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      tableName: 'chats',
      underscored: true,
      timestamps: true,
      paranoid: true,
    });
  
    return Chat;
  };
  
