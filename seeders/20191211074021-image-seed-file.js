'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Images', [
      {
        url: 'https://i.imgur.com/3PeyRI9.jpg',
        ProductId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/becWGwT.jpg',
        ProductId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/pncE1NX.jpg',
        ProductId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/wk3ABut.jpg',
        ProductId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/QrRaiXb.jpg',
        ProductId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/fkMsPaQ.jpg',
        ProductId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/fkMsPaQ.jpg',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/GqSNT75.png',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/xq1nG5M.png',
        ProductId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/u4zoxzv.png',
        ProductId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/dDp5Agj.png',
        ProductId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/qipxrfd.png',
        ProductId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/kExptYv.png',
        ProductId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/BWDqyVc.png',
        ProductId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/PfpI6Px.png',
        ProductId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/efa55pU.png',
        ProductId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/3sFyW9M.png',
        ProductId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/8G7zWeT.png',
        ProductId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/U2lATjy.png',
        ProductId: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/C7PGe0N.png',
        ProductId: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        url: 'https://i.imgur.com/3oR1275.png',
        ProductId: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Images', null, {});
  }
};
