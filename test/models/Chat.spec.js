process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ChatModel = require('../../models/chat');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Chat Model', () => {
  const Chat = ChatModel(sequelize, dataTypes);
  checkModelName(Chat)('Chat');

  context('properties', () => {
    const chat = new Chat();
    ['name'].forEach(checkPropertyExists(chat));
  });

  context('associations', () => {
    const [ChatItem] = ['ChatItem'];

    before(() => {
      Chat.associate({ ChatItem });
    });

    it('should has many chatItem', done => {
      Chat.hasMany.should.have.been.calledWith(ChatItem);
      done();
    });
  });
  context('action', () => {
    let data = null;
    const requiredColumns = { name: 'test' };

    it('create', done => {
      db.Chat.create(requiredColumns)
        .then(chat => {
          data = chat;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Chat.findByPk(data.id)
        .then(chat => {
          data.id.should.be.equal(chat.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Chat.update({}, { where: { id: data.id } })
        .then(() => db.Chat.findByPk(data.id))
        .then(chat => {
          data.updatedAt.should.be.not.equal(chat.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Chat.destroy({ where: { id: data.id } })
        .then(() => db.Chat.findByPk(data.id))
        .then(chat => {
          should.not.exist(chat);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
