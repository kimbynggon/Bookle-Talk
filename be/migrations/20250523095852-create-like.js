'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Books',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addConstraint('Likes', {
      fields: ['user_id', 'book_id'],
      type: 'unique',
      name: 'unique_like_user_book'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
  }
};
