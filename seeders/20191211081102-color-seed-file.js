'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Colors', [
      {
        name: 'black',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blue',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'yellow',
        ProductId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'black',
        ProductId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blue',
        ProductId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'yellow',
        ProductId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'yellow',
        ProductId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'black',
        ProductId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blue',
        ProductId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'black',
        ProductId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blue',
        ProductId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        ProductId: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Colors', null, {});
  }
};
