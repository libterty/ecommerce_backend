'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('CouponItems', [
      {
        CouponId: 1,
        UserId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        CouponId: 2,
        UserId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        CouponId: 3,
        UserId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        CouponId: 4,
        UserId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        CouponId: 4,
        UserId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CouponItems', null, {});
  }
};
