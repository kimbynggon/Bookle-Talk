module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    book_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    user_id: { 
      type: DataTypes.STRING, 
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'user_id'        
      }
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'Chats',
    timestamps: false,
    underscored: true
  });

  Chat.associate = function(models) {
    Chat.belongsTo(models.Book, { foreignKey: 'book_id' });
    Chat.belongsTo(models.User, { 
      foreignKey: 'user_id',
      targetKey: 'user_id', 
      as: 'user'
    });
  };
  return Chat;
};