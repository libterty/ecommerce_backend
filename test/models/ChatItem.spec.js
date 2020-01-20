process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ChatItemModel = require('../../models/chatitem');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# ChatItem Model', () => {
  const ChatItem = ChatItemModel(sequelize, dataTypes);
  checkModelName(ChatItem)('ChatItem');

  context('properties', () => {
    const chatItem = new ChatItem();
    ['question', 'answer', 'ChatId'].forEach(checkPropertyExists(chatItem));
  });

  context('associations', () => {
    const Chat = 'Chat';
    before(() => {
      ChatItem.associate({ Chat });
    });

    it('should belong to one Chat', done => {
      ChatItem.belongsTo.should.have.been.calledWith(Chat);
      done();
    });
  });

  context('action', () => {
    let data = null;
    const requiredColumns = {
      question: 'test question',
      answer: 'test answer',
      ChatId: 1
    };
    it('create', done => {
      db.ChatItem.create(requiredColumns)
        .then(chatItem => {
          data = chatItem;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.ChatItem.findByPk(data.id)
        .then(chatItem => {
          data.id.should.be.equal(chatItem.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.ChatItem.update({}, { where: { id: data.id } })
        .then(() => db.ChatItem.findByPk(data.id))
        .then(chatItem => {
          data.updatedAt.should.be.not.equal(chatItem.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.ChatItem.destroy({ where: { id: data.id } })
        .then(() => db.ChatItem.findByPk(data.id))
        .then(chatItem => {
          should.not.exist(chatItem);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
