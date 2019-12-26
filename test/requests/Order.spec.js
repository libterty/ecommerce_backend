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

describe('# Order Request', () => {
  context('# Create Order', () => {
    describe('When user requests to create order', () => {
      before(async () => {
        let token;
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1 });
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
        await db.OrderItem.destroy({ where: {}, truncate: true });
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
        await db.Product.create({
          name: '測試商品1',
          cost: 3000,
          price: 6000
        });
        await db.Product.create({
          name: '測試商品2',
          cost: 3000,
          price: 6000
        });
        await db.Product.create({
          name: '測試商品3',
          cost: 3000,
          price: 6000
        });
        await db.Color.create({
          name: 'black',
          ProductId: 1
        });
        await db.Color.create({
          name: 'white',
          ProductId: 2
        });
        await db.Color.create({
          name: 'white',
          ProductId: 3
        });
        await db.Inventory.create({
          quantity: 5,
          ProductId: 1,
          ColorId: 1
        });
        await db.Inventory.create({
          quantity: 5,
          ProductId: 2,
          ColorId: 2
        });
        await db.Inventory.create({
          quantity: 5,
          ProductId: 3,
          ColorId: 3
        });
        await db.Cart.create({});
        await db.Cart.create({});
        await db.CartItem.create({
          price: 6000,
          quantity: 2,
          CartId: 1,
          ProductId: 1,
          ColorId: 1
        });
        await db.CartItem.create({
          price: 6000,
          quantity: 2,
          CartId: 1,
          ProductId: 2,
          ColorId: 2
        });
        await db.CartItem.create({
          price: 6000,
          quantity: 6,
          CartId: 2,
          ProductId: 3,
          ColorId: 3
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
          .post('/api/orders/create')
          .set('Authorization', 'bearer ' + token)
          .send({
            CartId: 1,
            UserId: 2
          })
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 400 when required fill is not meet', done => {
        request(app)
          .post('/api/orders/create')
          .set('Authorization', 'bearer ' + token)
          .send({
            UserId: 1
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("required field didn't exist");
            done();
          });
      });

      it('should return 400 when no order is Created', done => {
        request(app)
          .post('/api/orders/create')
          .set('Authorization', 'bearer ' + token)
          .send({
            CartId: 2,
            UserId: 1
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            db.Order.findByPk(1).then(order => {
              expect(res.body.status).to.equal('error');
              expect(res.body.message).to.equal('Create order fail');
              expect(order).to.equal(null);
              return done();
            });
          });
      });

      it('should not have anything is Order db', done => {
        db.Order.findAll().then(order => {
          expect(order.length).to.equal(0);
          return done();
        });
      });

      it('should return 200 when order is Created', done => {
        request(app)
          .post('/api/orders/create')
          .set('Authorization', 'bearer ' + token)
          .send({
            CartId: 1,
            UserId: 1
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Order.findByPk(2).then(order => {
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('Create order success');
              expect(order.total_amount).to.equal(24000);
              return done();
            });
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
        await db.OrderItem.destroy({ where: {}, truncate: true });
      });
    });
  });
});
