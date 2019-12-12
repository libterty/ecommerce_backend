'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'CartItems',
      Array.from({ length: 4 }).map((item, index) => ({
        id: index + 1,
        CartId: Math.floor(Math.random() * 3) + 1,
        ProductId: Math.floor(Math.random() * 6) + 1,
        quantity: Math.floor(Math.random() * 10) + 1,
        price: Math.floor(Math.random() * 3000) + 1,
        ColorId: Math.floor(Math.random() * 3) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })), {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CartItems', null, {});
  }
};