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

      it('should return 400 when User has already have order in list', done => {
        request(app)
          .post('/api/orders/create')
          .set('Authorization', 'bearer ' + token)
          .send({
            CartId: 1,
            UserId: 1
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Please submit your order first before creating new one'
            );
            done();
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

  context('# Get Order', () => {
    describe('When user request to get Orders', () => {
      before(async () => {
        let test1token;
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
        await db.Product.create({
          name: 'test1Product',
          cost: 5000,
          price: 10000
        });
        await db.Product.create({
          name: 'test2Product',
          cost: 5000,
          price: 10000
        });
        await db.Product.create({
          name: 'test3Product',
          cost: 5000,
          price: 10000
        });
        await db.Order.create({
          payment_status: '未付款',
          total_amount: 20000,
          name: 'test1',
          UserId: 1
        });
        await db.OrderItem.create({
          price: 10000,
          quantity: 1,
          OrderId: 1,
          ProductId: 2,
          ColorId: 4
        });
        await db.OrderItem.create({
          price: 10000,
          quantity: 1,
          OrderId: 1,
          ProductId: 3,
          ColorId: 4
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
            test1token = res.body.token;
            done();
          });
      });

      it('should return 401 when malware request', done => {
        request(app)
          .get('/api/orders/2')
          .set('Authorization', 'bearer ' + test1token)
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 200 when Order is exist', done => {
        request(app)
          .get('/api/orders/1')
          .set('Authorization', 'bearer ' + test1token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.OrderItem.findAll({
              where: { OrderId: 1 }
            }).then(orders => {
              expect(res.body.status).to.equal('success');
              expect(res.body.order.total_amount).to.equal(20000);
              return done();
            });
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
        await db.OrderItem.destroy({ where: {}, truncate: true });
      });
    });

    describe('When user request to get Orders', () => {
      before(async () => {
        let test2token;
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 2 });
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
          name: 'test1Product',
          cost: 5000,
          price: 10000
        });
        await db.Product.create({
          name: 'test2Product',
          cost: 5000,
          price: 10000
        });
        await db.Product.create({
          name: 'test3Product',
          cost: 5000,
          price: 10000
        });
        await db.Order.create({
          payment_status: '未付款',
          total_amount: 20000,
          name: 'test1',
          UserId: 1
        });
        await db.Order.create({
          payment_status: '已付款',
          total_amount: 30000,
          name: 'test1',
          UserId: 2
        });
        await db.OrderItem.create({
          price: 10000,
          quantity: 1,
          OrderId: 1,
          ProductId: 2,
          ColorId: 4
        });
        await db.OrderItem.create({
          price: 10000,
          quantity: 1,
          OrderId: 1,
          ProductId: 3,
          ColorId: 4
        });
      });

      it('should return 200 and test1 token', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test2@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            test2token = res.body.token;
            done();
          });
      });

      it('should return 200 when Order is exist', done => {
        request(app)
          .get('/api/orders/2')
          .set('Authorization', 'bearer ' + test2token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Nothing in your order list');
            done();
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
        await db.OrderItem.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Put Order', () => {
    describe('When user request to change order context', () => {
      before(async () => {
        let test1token;
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
        await db.Order.create({
          order_status: '訂單處理中',
          shipping_status: '未出貨',
          payment_status: '未付款',
          total_amount: 300,
          name: 'test1',
          address: '測試路',
          email: 'test1@example.com',
          phone: '02-8888-8888',
          UserId: 1
        });
        await db.Order.create({
          order_status: '訂單處理中',
          shipping_status: '未出貨',
          payment_status: '未付款',
          total_amount: 3001,
          name: 'test1',
          address: '測試路',
          email: 'test1@example.com',
          phone: '02-8888-8888',
          UserId: 1
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
            test1token = res.body.token;
            done();
          });
      });

      it('should return 401 when malware request', done => {
        request(app)
          .put('/api/orders/1/users/2')
          .set('Authorization', 'bearer ' + test1token)
          .send({})
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 400 when non shipping data is send', done => {
        request(app)
          .put('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({})
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("required field didn't exist");
            done();
          });
      });

      it('should return 400 when malware shippingMethod data is send', done => {
        request(app)
          .put('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '郵局',
            shippingStatus: '未出貨',
            shippingFee: 350
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("shippingMethod didn't exist");
            done();
          });
      });

      it('should return 400 when malware shippingStatus data is send', done => {
        request(app)
          .put('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '黑貓宅急便',
            shippingStatus: '已出貨',
            shippingFee: 350
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('wrong shippingStatus');
            done();
          });
      });

      it('should return 400 when malware shippingStatus data is send', done => {
        request(app)
          .put('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '黑貓宅急便',
            shippingStatus: '未出貨',
            shippingFee: 351
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("shippingFee didn't exist");
            done();
          });
      });

      it('should return 400 when no Order data is found', done => {
        request(app)
          .put('/api/orders/3/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '黑貓宅急便',
            shippingStatus: '未出貨',
            shippingFee: 350
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Cannot find this Order');
            done();
          });
      });

      it('should return 200 when Order data is found and need to add shipping fee', done => {
        request(app)
          .put('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '黑貓宅急便',
            shippingStatus: '未出貨',
            shippingFee: 350
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Order.findByPk(1).then(order => {
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('Update order success');
              expect(order.total_amount).to.equal(650);
              return done();
            });
          });
      });

      it('should return 200 when Order data is found but no need to add shipping fee', done => {
        request(app)
          .put('/api/orders/2/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .send({
            shippingMethod: '黑貓宅急便',
            shippingStatus: '未出貨',
            shippingFee: 350
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Order.findByPk(2).then(order => {
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('Update order success');
              expect(order.total_amount).to.equal(3001);
              return done();
            });
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Delete Order', () => {
    describe('When user request to delete order context', () => {
      before(async () => {
        let test1token;
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
        await db.Order.create({
          order_status: '訂單處理中',
          shipping_status: '未出貨',
          payment_status: '未付款',
          total_amount: 300,
          name: 'test1',
          address: '測試路',
          email: 'test1@example.com',
          phone: '02-8888-8888',
          UserId: 1
        });
        await db.Product.create({
          name: 'test1Product',
          cost: 300,
          price: 400
        });
        await db.Product.create({
          name: 'test2Product',
          cost: 300,
          price: 400
        });
        await db.Color.create({
          name: 'black',
          ProductId: 1
        });
        await db.Color.create({
          name: 'black',
          ProductId: 2
        });
        await db.Inventory.create({
          quantity: 3,
          ProductId: 1,
          ColorId: 1
        });
        await db.Inventory.create({
          quantity: 5,
          ProductId: 2,
          ColorId: 2
        });
        await db.OrderItem.create({
          price: 150,
          quantity: 3,
          OrderId: 1,
          ProductId: 1,
          ColorId: 1
        });
        await db.OrderItem.create({
          price: 150,
          quantity: 3,
          OrderId: 1,
          ProductId: 2,
          ColorId: 2
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
            test1token = res.body.token;
            done();
          });
      });

      it('should return 401 when malware request', done => {
        request(app)
          .delete('/api/orders/1/users/2')
          .set('Authorization', 'bearer ' + test1token)
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not find any user data');
            done();
          });
      });

      it('should return 200 when delete order success', done => {
        request(app)
          .delete('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Inventory.findAll().then(inventories => {
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('Delete order success');
              expect(inventories[0].quantity).to.equal(6);
              expect(inventories[1].quantity).to.equal(8);
              return done();
            });
          });
      });

      it('should return 400 when order is not exist', done => {
        request(app)
          .delete('/api/orders/1/users/1')
          .set('Authorization', 'bearer ' + test1token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            db.Inventory.findAll().then(inventories => {
              expect(res.body.status).to.equal('error');
              expect(res.body.message).to.equal('Cannot find this order');
              expect(inventories[0].quantity).to.equal(6);
              expect(inventories[1].quantity).to.equal(8);
              return done();
            });
          });
      });

      after(async () => {
        this.getUser.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Order.destroy({ where: {}, truncate: true });
        await db.OrderItem.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });
});
