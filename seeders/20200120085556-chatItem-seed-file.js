'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ChatItems', [
      {
        question: 'What kind of shipping option we have',
        answer: 'We only support icat shipping so far',
        ChatId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'What is the shipping cost',
        answer:
          'Payment above 3000 did not count shipping fee, payment under 300 will charge 150 shipping fee per payment',
        ChatId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'When will my shipping arrive?',
        answer:
          'We estimate your shipping will arrive within 3 - 7 working days when you complete the payment',
        ChatId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Who takes care for returning the shipping fee',
        answer:
          'It depends on shipping conidtion and the reason why the shipments are return, if the shipment is return due to dislike you will have to charge 150 per return, if it is related to quality issue non shipping fee will be charged',
        ChatId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'How does return payment process work',
        answer:
          'Return payment process take place when your shippments return to our side',
        ChatId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Is the payment process secure',
        answer:
          'Yes it is, we use third party authentication to ensure the whole process is under secure',
        ChatId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Do you have specific detail for products',
        answer:
          'Yes please select the product you want, then you can find specific detail in it',
        ChatId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'How is the quality control for the products',
        answer:
          'We make sure all of products is under well condition circumstances before we sell out',
        ChatId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Can I change user information',
        answer:
          'Yes, please go to your personal profile then you can make the change',
        ChatId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ChatItems', null, {});
  }
};
