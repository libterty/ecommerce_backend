process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const helpers = require('../../_helpers');
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
      });
      it('1. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({
            name: 'user1',
            email: 'user1@example.com',
            password: '123456',
            passwordCheck: '12345678'
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal('Passwords are not the same');
            done();
          });
      });
      it('2. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({
            name: 'user1',
            email: 'user1@example.com',
            password: '12345',
            passwordCheck: '12345'
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal(
              'Password length must greater or equal than 6'
            );
            done();
          });
      });
      it('3. should return 400 and get error message', done => {
        request(app)
          .post('/api/signup')
          .send({
            name: 'user1',
            email: 'user1@example.com',
            password: '123456',
            passwordCheck: ''
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal('All fields are required');
            done();
          });
      });
      it('4. should return 400 status code and error message', done => {
        request(app)
          .post('/api/signup')
          .send({
            name: 'user1',
            email: 'test1@example.com',
            password: '12345678',
            passwordCheck: '12345678'
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal(
              'This Email is already registered'
            );
            done();
          });
      });
      it('5. should return 200 status code and create User', done => {
        request(app)
          .post('/api/signup')
          .send({
            name: 'user2',
            email: 'user2@example.com',
            password: '123456',
            passwordCheck: '123456'
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('success');
            expect(res.body.message).to.be.equal('Register successfully!');
            done();
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });
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
  context('# Get User Data Request', () => {
    describe('When request to get user data', () => {
      before(async () => {
        let test1Token;
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1 });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
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
            test1Token = res.body.token;
            done();
          });
      });

      it('should return 401 when malware request', done => {
        request(app)
          .get('/api/users/2')
          .set('Authorization', 'bearer ' + test1Token)
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 200 when test1 is exist', done => {
        request(app)
          .get('/api/users/1')
          .set('Authorization', 'bearer ' + test1Token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.user.name).to.equal('test1');
            done();
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Put User Data Request', () => {
    describe('# When User request to Change Info', () => {
      before(async () => {
        let token;
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1 });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
        });
        await db.User.create({
          name: 'test2',
          email: 'test2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
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

      it('should return 401 when malware request', done => {
        request(app)
          .put('/api/users/2')
          .set('Authorization', 'bearer ' + token)
          .send({})
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 400 when password length did not meet requirement', done => {
        request(app)
          .put('/api/users/1')
          .set('Authorization', 'bearer ' + token)
          .send({
            name: 'testFail',
            email: 'testFail@example.com',
            password: '1234'
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Password length must greater or equal than 6'
            );
            done();
          });
      });

      it('should return 400 when email is already in use', done => {
        request(app)
          .put('/api/users/1')
          .set('Authorization', 'bearer ' + token)
          .send({
            email: 'test2@example.com'
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Email is already in use');
            done();
          });
      });

      it.skip('should return 400 when image upload fail', done => {
        request(app)
          .put('/api/users/1')
          .set('Authorization', 'bearer ' + token)
          .field('Content-Type', 'multipart/form-data')
          .field('name', 'testFail')
          .field('email', 'testFail@example.com')
          .field('password', '12345678')
          .field('birthday', '')
          .attach('avatar', 'upload/test2.jpg')
          .field('address', 'test road test street')
          .field('tel', '02-8888-8888')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Image Upload Fail');
            done();
          });
      });

      it('should return 200 when image upload success', done => {
        request(app)
          .put('/api/users/1')
          .set('Authorization', 'bearer ' + token)
          .field('Content-Type', 'multipart/form-data')
          .field('name', 'testSuccess')
          .field('email', 'testSuccess@example.com')
          .field('password', '12345678')
          .field('birthday', '')
          .attach('avatar', 'upload/test.jpg')
          .field('address', 'test road test street')
          .field('tel', '02-8888-8888')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('update info success 1');
            done();
          });
      });

      it('should return 200 when upadte without image', done => {
        request(app)
          .put('/api/users/1')
          .set('Authorization', 'bearer ' + token)
          .send({
            name: 'testSuccess2',
            email: 'testSuccess2@example.com',
            password: '12345678',
            address: 'test road test street',
            tel: '02-8888-8888'
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('update info success 2');
            done();
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Get Current user', () => {
    describe('When request to get user session data', () => {
      before(async () => {
        let test1Token;
        this.getUser = sinon.stub(helpers, 'getUser').returns({
          id: 1,
          name: 'test1',
          email: 'test1@example.com',
          admin: false
        });
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
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
            test1Token = res.body.token;
            done();
          });
      });

      it('should return 200 when test1 is exist and get session data', done => {
        request(app)
          .get('/api/get_current_user')
          .set('Authorization', 'bearer ' + test1Token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.name).to.equal('test1');
            expect(res.body.email).to.equal('test1@example.com');
            done();
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });
});
