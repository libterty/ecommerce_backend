'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Inventories', [
      {
        quantity: 10,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 20,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 0,
        ProductId: 1,
        ColorId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 20,
        ProductId: 2,
        ColorId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 5,
        ProductId: 2,
        ColorId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 0,
        ProductId: 3,
        ColorId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 10,
        ProductId: 3,
        ColorId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 12,
        ProductId: 4,
        ColorId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 2,
        ProductId: 5,
        ColorId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 0,
        ProductId: 4,
        ColorId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 3,
        ProductId: 6,
        ColorId: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 1,
        ProductId: 5,
        ColorId: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 23,
        ProductId: 7,
        ColorId: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 13,
        ProductId: 8,
        ColorId: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 12,
        ProductId: 9,
        ColorId: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 8,
        ProductId: 10,
        ColorId: 16,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 28,
        ProductId: 11,
        ColorId: 17,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 22,
        ProductId: 12,
        ColorId: 18,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quantity: 16,
        ProductId: 13,
        ColorId: 19,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Inventories', null, {});
  }
};
