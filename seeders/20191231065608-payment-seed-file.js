'use strict';
const shortId = require('shortid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Payments', [
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '尚未付款',
        paid_at: null,
        OrderId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/03/08'),
        OrderId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/05/08'),
        OrderId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/05/09'),
        OrderId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/07/08'),
        OrderId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/08/08'),
        OrderId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        params: `${shortId.generate()}`,
        total_amount: 19000,
        payment_method: '信用卡',
        payment_status: '已付款',
        paid_at: new Date('2019/09/08'),
        OrderId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Payments', null, {});
  }
};
