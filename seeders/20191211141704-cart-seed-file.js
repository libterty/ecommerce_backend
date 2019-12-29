'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Carts',
      Array.from({ length: 4 }).map((item, index) => ({
        id: index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Carts', null, {});
  }
};
