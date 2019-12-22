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
          .expect(200)
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

      after(async function() {
        await db.Cart.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
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
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1 })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.status).to.be.equal('error');
                done();
              });
          });
      });
      it('should not get cart data without req.body.quantity and return error message', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.status).to.be.equal('error');
                done();
              });
          });
      });
      it('should not get cart data without req.body.colorId and return error message', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, quantity: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.status).to.be.equal('error');
                done();
              });
          });
      });
      it('should not get cart data without req.body.productId and return error message', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ colorId: 1, quantity: 1, cost: 11, price: 500 })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.status).to.be.equal('error');
                done();
              });
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
});
