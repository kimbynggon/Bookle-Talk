'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Books', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      authors: {
        type: Sequelize.STRING,
        allowNull: false
      },
      thumbnail: {
        type: Sequelize.STRING
      },
      datetime: {
        type: Sequelize.STRING,
        allowNull: false
      },
      publisher: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isbn: {
        type: Sequelize.STRING,
        unique: true
      },
      price: {
        type: Sequelize.INTEGER
      },
      translators: {
        type: Sequelize.STRING
      },
      contents: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      url: {
        type: Sequelize.TEXT
      },
      avg: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0.0,
        validate: { min: 0.0, max: 5.0 }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Books');
  }
};
