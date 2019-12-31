'use strict';
const shortId = require('shortid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Orders', [
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單處理中',
        shipping_status: '未出貨',
        payment_status: '未付款',
        total_amount: 19000,
        name: 'root',
        address: '新北市成功路一段23號4樓',
        email: 'root@example.com',
        phone: '02-8383-3838',
        invoice: '',
        UserId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user1',
        address: '台南市建國北路一段23號4樓',
        email: 'user1@example.com',
        phone: '08-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user1',
        address: '台南市建國北路一段23號4樓',
        email: 'user1@example.com',
        phone: '08-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user2',
        address: '屏東縣濱海路一段177號4樓',
        email: 'user2@example.com',
        phone: '03-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user2',
        address: '屏東縣濱海路一段177號4樓',
        email: 'user2@example.com',
        phone: '03-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user2',
        address: '屏東縣濱海路一段177號4樓',
        email: 'user2@example.com',
        phone: '03-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sn: `${shortId.generate()}`,
        order_status: '訂單已結案',
        shipping_status: '已出貨',
        payment_status: '已付款',
        total_amount: 19000,
        name: 'user2',
        address: '屏東縣濱海路一段177號4樓',
        email: 'user2@example.com',
        phone: '03-8383-3838',
        invoice: `${shortId.generate()}`,
        UserId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {});
  }
};
