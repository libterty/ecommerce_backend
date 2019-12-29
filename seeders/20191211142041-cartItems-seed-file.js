'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('CartItems', [
      {
        price: 13800,
        quantity: 3,
        CartId: 1,
        ProductId: 2,
        ColorId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 13800,
        quantity: 2,
        CartId: 1,
        ProductId: 2,
        ColorId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 13800,
        quantity: 4,
        CartId: 2,
        ProductId: 2,
        ColorId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 13800,
        quantity: 3,
        CartId: 3,
        ProductId: 2,
        ColorId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 17700,
        quantity: 3,
        CartId: 3,
        ProductId: 4,
        ColorId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 17700,
        quantity: 1,
        CartId: 3,
        ProductId: 4,
        ColorId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 14800,
        quantity: 1,
        CartId: 3,
        ProductId: 5,
        ColorId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 10900,
        quantity: 1,
        CartId: 4,
        ProductId: 3,
        ColorId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CartItems', null, {});
  }
};
