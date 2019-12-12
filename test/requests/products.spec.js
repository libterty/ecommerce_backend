process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Product request', () => {
  context('# Home Request', () => {
    describe('When Visit HomePage', () => {
      before(async () => {
        await db.Product.create({ name: 'Product1 Test', price: 3000 });
        await db.Product.create({ name: 'Product2 Test', price: 3000 });
        await db.Image.create({ url: 'test1.jpg', ProductId: 1 });
        await db.Image.create({ url: 'test2.jpg', ProductId: 2 });
      });

      it('should return 200 and get json data', done => {
        request(app)
          .get('/api/furnitures')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.products[0].name).to.equal('Product1 Test');
            done();
          });
      });

      after(async () => {
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
      });
    });
  });
});
