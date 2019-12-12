process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const app = require('../../index');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Cart request', () => {
  context('# GET', () => {
    before(async function() {
      await db.Cart.destroy({ where: {}, truncate: true });
      await db.Product.destroy({ where: {}, truncate: true });
      await db.Color.destroy({ where: {}, truncate: true });
      await db.CartItem.destroy({ where: {}, truncate: true });
      await db.Product.create({ id: 1, name: 'Sofa', price: 9999 });
      await db.Product.create({ id: 2, name: 'Desk', price: 5999 });
    });
    // should check inventories stock
    it('GET cart data', done => {
      let agent = request.agent(app);
      agent
        .post('/api/cart')
        // TODO: missing imageID?
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
    it('Can not get cart data', done => {
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
});
