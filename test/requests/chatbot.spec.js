process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const db = require('../../models');
const Cache = require('../../util/cache');
const should = chai.should();
const expect = chai.expect;
const cache = new Cache();

describe('# Chat Request', () => {
  context('# ChatBot Request', () => {
    describe('When User request to ask question', () => {
      before(async () => {
        await db.Chat.create({
          name: 'test category'
        });
        await db.ChatItem.create({
          question: 'test question',
          answer: 'test answer',
          ChatId: 1
        });
        await cache.del('getChatBot');
      });

      it('should return 200 with data from RDBMS', done => {
        request(app)
          .get('/api/chatbot')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('success1');
            expect(res.body.chats[0].name).to.equal('test category');
            done();
          });
      });

      it('should return 200 with data from cache', done => {
        request(app)
          .get('/api/chatbot')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal(undefined);
            expect(res.body.chats[0].name).to.equal('test category');
            done();
          });
      });

      after(async () => {
        await db.Chat.destroy({ where: {}, truncate: true });
        await db.ChatItem.destroy({ where: {}, truncate: true });
        await cache.del('getChatBot');
      });
    });
  });
});
