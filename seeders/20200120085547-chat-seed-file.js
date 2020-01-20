'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Chats', [
      {
        name: 'shipping',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'payment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'product',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Chats', null, {});
  }
};
