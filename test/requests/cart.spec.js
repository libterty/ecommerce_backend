process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const app = require('../../index');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Cart request', () => {
  context('# Add to cart', () => {
    describe('Add product and show cart', () => {
      before(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });

        await db.Product.create({
          id: 1,
          name: 'Sofa',
          cost: 3333,
          price: 9999
        });
        await db.Product.create({
          id: 2,
          name: 'Desk',
          cost: 3333,
          price: 5999
        });
        await db.Color.create({ id: 1, name: 'white', ProductId: 1 });
        await db.Color.create({ id: 2, name: 'black', ProductId: 1 });
        await db.Color.create({ id: 3, name: 'black', ProductId: 2 });
        await db.Image.create({
          id: 1,
          ProductId: 1,
          url: 'https://i.imgur.com/3PeyRI9.jpg'
        });
        await db.Image.create({
          id: 2,
          ProductId: 2,
          url: 'https://i.imgur.com/becWGwT.jpg'
        });
        await db.Inventory.create({ quantity: 10, ProductId: 1, ColorId: 1 });
        await db.Inventory.create({ quantity: 6, ProductId: 1, ColorId: 2 });
        await db.Inventory.create({ quantity: 5, ProductId: 2, ColorId: 3 });
      });

      it('should GET cart data and return success json message and total price', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.cart[0].id).to.be.equal(1);
                expect(res.body.totalPrice).to.be.equal(9999);
                expect(res.body.cart[0].Inventories.quantity).to.be.equal(10);
                expect(res.body.status).to.be.equal('success');
                done();
              });
          });
      });

      it('should not get cart data without session.cartId and return error message', done => {
        let agent = request.agent(app);
        agent
          .get('/api/cart')
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            done();
          });
      });

      it('should get product of images which are in the cart', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                expect(res.body.cart[0].Image.url).to.be.equal(
                  'https://i.imgur.com/3PeyRI9.jpg'
                );
                done();
              });
          });
      });

      it('should get product of colors which are in the cart', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                expect(res.body.cart[0].Color.name).to.be.equal('white');
                done();
              });
          });
      });

      it('should get product of inventories which are in the cart', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                expect(res.body.cart[0].Inventories.quantity).to.be.equal(10);
                done();
              });
          });
      });

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });

    describe('Have an empty req.body', () => {
      before(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Product.create({
          id: 1,
          name: 'Sofa',
          cost: 1111,
          price: 9999
        });
        await db.Product.create({
          id: 2,
          name: 'Desk',
          cost: 1111,
          price: 5999
        });
      });

      it('should not get cart data without req.body.price and return error message', done => {
        request(app)
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1 })
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res) {
            if (err) done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.equal('price is missing');
            done();
          });
      });

      it('should not get cart data without req.body.quantity and return error message', done => {
        request(app)
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res) {
            if (err) done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.equal('quantity is missing');
            done();
          });
      });

      it('should not get cart data without req.body.colorId and return error message', done => {
        request(app)
          .post('/api/cart')
          .send({ productId: 1, quantity: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res) {
            if (err) done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.equal('Fail to find products');
            done();
          });
      });

      it('should not get cart data without req.body.productId and return error message', done => {
        request(app)
          .post('/api/cart')
          .send({ colorId: 1, quantity: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(400)
          .end(function(err, res) {
            if (err) done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.equal('Fail to find products');
            done();
          });
      });

      it('should return 200 and receive Add to cart', done => {
        request(app)
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) done(err);
            expect(res.body.status).to.be.equal('success');
            expect(res.body.message).to.equal('Added to cart');
            done();
          });
      });

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Manipulate cart item', () => {
    describe('Add up cart item', () => {
      before(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.CartItem.create({
          id: 1,
          quantity: 1,
          CartId: 1,
          price: 9999,
          ProductId: 2,
          ColorId: 1
        });
        await db.Inventory.create({
          quantity: 2,
          ProductId: 1,
          ColorId: 1
        });
      });

      it('should not add up when cartItem not in the cart and return error status', done => {
        request(app)
          .post('/api/cart/1/add')
          .send()
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal(
              'Cannot update item not in the cart'
            );
            done();
          });
      });

      it('should add up and return success status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .post('/api/cart/2/add')
              .send()
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('success');
                expect(res.body.message).to.be.equal(
                  'Update cart successfully'
                );
                done();
              });
          });
      });

      it('should not add up and return error status when inventory is not enough', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .post('/api/cart/2/add')
              .send()
              .expect(400)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('error');
                expect(res.body.message).to.be.equal('Inventory is not enough');
                done();
              });
          });
      });

      it('should not add up when cartItem not exists and return error status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .post('/api/cart/0/add')
              .send()
              .expect(500)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('error');
                expect(res.body.message).to.be.equal(
                  'Fail to add up cart item'
                );
                done();
              });
          });
      });

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });

    describe('Subtract cart item', () => {
      before(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.CartItem.create({
          id: 1,
          quantity: 1,
          CartId: 1,
          price: 9999,
          ProductId: 2,
          ColorId: 1
        });
      });

      it('should not subtract item quantity when cartItem not in the cart and return error status', done => {
        request(app)
          .post('/api/cart/1/sub')
          .send()
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal(
              'Cannot update item not in the cart'
            );
            done();
          });
      });

      it('should subtract item quantity and return success status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .post('/api/cart/2/sub')
              .send()
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('success');
                done();
              });
          });
      });

      it('should not subtract item quantity when not exists and return error status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .post('/api/cart/0/sub')
              .send()
              .expect(500)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('error');
                expect(res.body.message).to.be.equal(
                  'Fail to subtract cart item'
                );
                done();
              });
          });
      });

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
      });
    });

    describe('Delete cart item', () => {
      before(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.CartItem.create({
          id: 1,
          quantity: 1,
          CartId: 1,
          price: 9999,
          ProductId: 2,
          ColorId: 1
        });
      });

      it('should not delete cart item when cartItem not in the cart and return error status', done => {
        request(app)
          .delete('/api/cart/1/')
          .send()
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.be.equal('error');
            expect(res.body.message).to.be.equal(
              'Cannot update item not in the cart'
            );
            done();
          });
      });

      it('should delete cart item quantity and return success status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .delete('/api/cart/2/')
              .send()
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('success');
                done();
              });
          });
      });

      it('should not delete cart item quantity when not exists and return error status', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 9999 })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            agent
              .delete('/api/cart/0/')
              .send()
              .expect(500)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.be.equal('error');
                expect(res.body.message).to.be.equal(
                  'Fail to remove the item from cart'
                );
                done();
              });
          });
      });

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
      });
    });
  });
});
