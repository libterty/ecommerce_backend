'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categories', [
      {
        name: '沙發',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '床具',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '桌子',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '長桌',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '櫃子',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
