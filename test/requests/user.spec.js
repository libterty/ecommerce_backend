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
  context('# SignUp Request', () => {
    describe('When request to sign up', () => {
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      })
      it('1. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({ email: 'user1@example.com', password: '123456', passwordCheck: '12345678' })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error')
            expect(res.body.message).to.be.equal('Passwords are not the same')
            done();
          })
      })
      it('2. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({ email: 'user1@example.com', password: '12345', passwordCheck: '12345' })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error')
            expect(res.body.message).to.be.equal('Password length must greater or equal than 6')
            done();
          })
      })
      it('3. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({ email: 'user1@example.com', password: '123456', passwordCheck: '' })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error')
            expect(res.body.message).to.be.equal('All fields are required')
            done();
          })
      })
      it('4. should return 400 status code and error message', done => {
        request(app)
          .post('/api/signup')
          .send({ email: 'test1@example.com', password: '12345678', passwordCheck: '12345678' })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error')
            expect(res.body.message).to.be.equal('This Email is already registered')
            done();
          })
      })
      it('5. should return 200 status code and create User', done => {
        request(app)
          .post('/api/signup')
          .send({ email: 'user2@example.com', password: '123456', passwordCheck: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('success')
            expect(res.body.message).to.be.equal('Register successfully!')
            done();
          })
      })
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      })
    })
  })
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