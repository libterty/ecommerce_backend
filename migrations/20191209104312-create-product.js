'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false
      },
      height: {
        type: Sequelize.INTEGER
      },
      width: {
        type: Sequelize.INTEGER
      },
      length: {
        type: Sequelize.INTEGER
      },
      weight: {
        type: Sequelize.INTEGER
      },
      material: {
        type: Sequelize.STRING
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      viewCounts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ratingCounts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  }
};
