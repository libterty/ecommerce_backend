process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Passport Request', () => {
  context('# Unauth Request', () => {
    describe('When request without auth', () => {
      let token;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      });

      it('should return 200 with admintoken', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            done();
          });
      });

      it('should return success when user is auth', done => {
        request(app)
          .get('/api/test')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Auth Test!');
            done();
          });
      });

      it('should return false when user is not auth', done => {
        request(app)
          .get('/api/test')
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            if (err) done(err);
            expect(res.unauthorized).to.equal(true);
            expect(res.text).to.equal('Unauthorized');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Auth Request', () => {
    describe('When request with auth', () => {
      let admintoken;
      let usertoken;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.User.create({
          name: 'test2',
          email: 'test2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
        });
      });

      it('should return 200 with admintoken', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            admintoken = res.body.token;
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            done();
          });
      });

      it('should return 200 with usertoken', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test2@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            usertoken = res.body.token;
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .get('/api/admin')
          .set('Authorization', 'bearer ' + admintoken)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Hello Admin!');
            done();
          });
      });

      it('should return 400 when user is not admin', done => {
        request(app)
          .get('/api/admin')
          .set('Authorization', 'bearer ' + usertoken)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('permission denied');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });
});
