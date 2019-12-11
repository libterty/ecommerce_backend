'use strict';
const bcrypt = require('bcryptjs');
const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'root',
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          birthday: new Date('1993/03/02'),
          admin: true,
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          address: '新北市成功路一段23號4樓',
          tel: '02-8383-3838',
          role: 'Admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user1',
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          birthday: new Date('1997/08/02'),
          admin: false,
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          address: '台南市建國北路一段23號4樓',
          tel: '08-8383-3838',
          role: 'User',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user2',
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          birthday: new Date('1991/05/02'),
          admin: false,
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          address: '屏東縣濱海路一段177號4樓',
          tel: '03-8383-3838',
          role: 'User',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
