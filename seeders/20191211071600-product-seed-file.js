'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Products', [
      {
        name: '原木化妝桌',
        description:
          '源自法國宮廷木匠完美呈現，大膽的藝術呈現在家具上，細膩而溫潤的質感 讓你一見鍾情',
        price: 18800,
        height: 77,
        width: 100,
        length: 45,
        weight: 5,
        material: '橡木系列',
        rating: 8,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '電動沙發',
        description: '義大利ITALPELLI黃牛皮，符合澳大利亞SAA國際質檢機構',
        price: 13800,
        height: 103,
        width: 90,
        length: 70,
        weight: 8,
        material: '全牛皮',
        rating: 5,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '咖啡桌大茶几',
        description: '100%純北美白橡木，簡約設計的咖啡矮桌',
        price: 10900,
        height: 45,
        width: 129,
        length: 56,
        weight: 10,
        material: '橡木系列',
        rating: 3,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '電視長櫃',
        description: '擁有自然紋理且簡約時尚的北美白橡木',
        price: 17700,
        height: 48,
        width: 180,
        length: 40,
        weight: 15,
        material: '橡木系列',
        rating: 9,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '北歐溫莎床架',
        description: '床架源自FAS級橡木，經過細膩的做工使床架的承重力更強',
        price: 14800,
        height: 99,
        width: 170,
        length: 212,
        weight: 25,
        material: '橡木系列',
        rating: 8,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '輕日北歐衣櫃',
        description: '輕日北歐，極簡無印系列，鄉村款',
        price: 33500,
        height: 205,
        width: 105,
        length: 55,
        weight: 15,
        material: '橡木系列',
        rating: 6,
        viewCounts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {});
  }
};
