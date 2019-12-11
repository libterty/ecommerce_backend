'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Colors', [
      {
        name: 'black',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'white',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blue',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'yellow',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Colors', null, {});
  }
};
