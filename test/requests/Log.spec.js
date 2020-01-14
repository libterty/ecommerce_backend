process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const helpers = require('../../_helpers');
const db = require('../../models');
const Logs = require('../../nosql/models/log');
const should = chai.should();
const expect = chai.expect;

const mochaAsync = fn => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

describe('# When Request coming', () => {
  context('# When Request hit api-gateway', () => {
    describe('# When logs is being requested', () => {
      before(async () => {
        await Logs.findOneAndDelete({ user_agent: 'test1' });
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1, name: 'test1' });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      });

      it('should return 200 and test1 token', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            token = res.body.token;
            done();
          });
      });

      it(
        'should have logs data',
        mochaAsync(async () => {
          const testData = await Logs.findOne({ user_agent: 'test1' });
          expect(testData.host).to.equal('127.0.0.1');
          expect(testData.originalUrl).to.equal('/api/signin');
          expect(testData.method).to.equal('POST');
          expect(testData.body.email).to.equal('test1@example.com');
        })
      );

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await Logs.findOneAndDelete({ user_agent: 'test1' });
      });
    });
  });
});

describe('# When Admin Request coming', () => {
  context('# When Request hit admin api-gateway', () => {
    describe('# When logs is being requested by admin', () => {
      let token;
      before(async () => {
        await Logs.findOneAndDelete({ user_agent: 'test1' });
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1, name: 'test1', admin: true });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      });

      it('should return 200 and test1 token', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            token = res.body.token;
            done();
          });
      });

      it('should return 200 with logs data', done => {
        request(app)
          .get('/api/admin/logs')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.logs.length).to.equal(1);
            done();
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await Logs.findOneAndDelete({ user_agent: 'test1' });
      });
    });
  });
});
