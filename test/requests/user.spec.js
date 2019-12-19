process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# User Request', () => {
  context('# SignIn Request', () => {
    describe('When request signin', () => {
      before(async () => {
        await db.User.create({
          name: 'tes1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      });

      it('should return 400 and get error message', done => {
        request(app)
          .post('/api/signin')
          .send({ email: '', password: '' })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("required fields didn't exist");
            done();
          });
      });

      it('should return 401 and get error message', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'no such user found or passwords did not match'
            );
            done();
          });
      });

      it('should return 401 and get error message', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '1234' })
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'no such user found or passwords did not match'
            );
            done();
          });
      });

      it('should return 200 and get user data', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });
});
