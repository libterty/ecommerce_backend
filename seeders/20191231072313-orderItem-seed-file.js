'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('OrderItems', [
      {
        price: 9500,
        quantity: 1,
        OrderId: 1,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 1,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 2,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 2,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 3,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 3,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 4,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 5,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 6,
        ProductId: 1,
        ColorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        price: 9500,
        quantity: 1,
        OrderId: 7,
        ProductId: 1,
        ColorId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('OrderItems', null, {});
  }
};
