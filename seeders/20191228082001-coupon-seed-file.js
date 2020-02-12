'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Coupons', [
      {
        coupon_code: 'SHIPPINGFREE',
        limited_usage: 100000001,
        expire_date: new Date('2050/07/12'),
        percent: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        coupon_code: 'DFH23K',
        limited_usage: 1,
        expire_date: new Date('2020/02/30'),
        percent: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        coupon_code: 'DKG18D',
        limited_usage: 1,
        expire_date: new Date('2020/02/30'),
        percent: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        coupon_code: 'EIDL01',
        limited_usage: null,
        expire_date: new Date('2019/09/30'),
        percent: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Coupons', null, {});
  }
};
