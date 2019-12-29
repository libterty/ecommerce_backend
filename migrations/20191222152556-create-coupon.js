'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Coupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coupon_code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      limited_usage: {
        type: Sequelize.INTEGER
      },
      expire_date: {
        type: Sequelize.DATE
      },
      type: {
        type: Sequelize.STRING
      },
      percent: {
        type: Sequelize.INTEGER
      },
      shipping_free: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Coupons');
  }
};
