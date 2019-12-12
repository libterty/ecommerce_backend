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
        await db.Color.destroy({ where: {}, truncate: true });
        await db.CartItem.destroy({ where: {}, truncate: true });
        await db.Product.create({ id: 1, name: 'Sofa', price: 9999 });
        await db.Product.create({ id: 2, name: 'Desk', price: 5999 });
      });
      // TODO: should check inventories stock
      it('should GET cart data and return success json message', done => {
        let agent = request.agent(app);
        agent
          .post('/api/cart')
          .send({ productId: 1, colorId: 1, quantity: 1, price: 500 })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            agent
              .get('/api/cart')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res) {
                if (err) done(err);
                expect(res.body.cart.id).to.be.equal(1);
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
        await db.Product.create({ id: 1, name: 'Sofa', price: 9999 });
        await db.Product.create({ id: 2, name: 'Desk', price: 5999 });
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
          .send({ productId: 1, colorId: 1, price: 500 })
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
          .send({ productId: 1, quantity: 1, price: 500 })
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
          .send({ colorId: 1, quantity: 1, price: 500 })
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
      });
    });
  });
});