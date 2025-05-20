// models/chat.model.js
module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'chats',
      timestamps: false,
      underscored: true
    });
  
    Chat.associate = function(models) {
      // 채팅과 사용자의 관계 (N:1)
      Chat.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
  
      // 채팅과 도서의 관계 (N:1)
      Chat.belongsTo(models.Book, {
        foreignKey: 'book_id',
        as: 'book'
      });
    };
  
    return Chat;
  };