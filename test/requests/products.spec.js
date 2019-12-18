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
        await db.Product.create({
          name: 'Product1 Test',
          cost: 1111,
          price: 3000
        });
        await db.Product.create({
          name: 'Product2 Test',
          cost: 1111,
          price: 3000
        });
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

    describe('When Visit HomePage with Image data', () => {
      before(async () => {
        await db.Product.create({
          name: 'Product1 Test',
          cost: 1111,
          price: 3000
        });
        await db.Product.create({
          name: 'Product2 Test',
          cost: 1111,
          price: 3000
        });
      });

      it('should return 200 and get json data', done => {
        request(app)
          .get('/api/furnitures')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.products[0].Image).to.equal(null);
            done();
          });
      });

      after(async () => {
        await db.Product.destroy({ where: {}, truncate: true });
      });
    });

    describe('When Visit Specific Product Page', () => {
      before(async () => {
        await db.Product.create({
          name: 'Product1 Test',
          cost: 1111,
          price: 3000
        });
        await db.Product.create({
          name: 'Product2 Test',
          cost: 1111,
          price: 3000
        });
        await db.Image.create({ url: 'test1.jpg', ProductId: 1 });
        await db.Image.create({ url: 'test2.jpg', ProductId: 2 });
        await db.Color.create({ name: 'Yellow', ProductId: 1 });
        await db.Color.create({ name: 'Green', ProductId: 2 });
        await db.Inventory.create({ quantity: 23, ProductId: 1 });
        await db.Inventory.create({ quantity: 12, ProductId: 2 });
      });

      it('should return 200 and get json data', done => {
        request(app)
          .get('/api/furnitures/1')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.product.name).to.equal('Product1 Test');
            expect(res.body.Images[0].url).to.equal('test1.jpg');
            expect(res.body.Colors[0].name).to.equal('Yellow');
            expect(res.body.Colors[0].Inventory.quantity).to.equal(23);
            done();
          });
      });

      it('should return 400 and get error message', done => {
        request(app)
          .get('/api/furnitures/3')
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Fail to find product');
            done();
          });
      });

      after(async () => {
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });
});
