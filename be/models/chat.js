module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    tableName: 'Chats',
    timestamps: false
  });

  Chat.associate = function(models) {
    Chat.belongsTo(models.Books, { foreignKey: 'book_id' });
    // User와의 관계 추가
    Chat.belongsTo(models.Users, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Chat;
};