process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Admin Request', () => {
  context('# Get All Products', () => {
    describe('When Visit Admin Home page', () => {
      let token;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'Product1 Test',
          cost: 1500,
          price: 3000
        });
        await db.Product.create({
          name: 'Product2 Test',
          cost: 1500,
          price: 3000
        });
        await db.Image.create({ url: 'test1.jpg', ProductId: 1 });
        await db.Image.create({ url: 'test2.jpg', ProductId: 2 });
        await db.Color.create({ name: 'Yellow', ProductId: 1 });
        await db.Color.create({ name: 'Black', ProductId: 2 });
        await db.Inventory.create({ quantity: 20, ProductId: 1, ColorId: 1 });
        await db.Inventory.create({ quantity: 10, ProductId: 2, ColorId: 2 });
      });

      it('should return 200 with admintoken', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            done();
          });
      });

      it('should return 200 with Json Data', done => {
        request(app)
          .get('/api/admin/products')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.products[0].name).to.equal('Product1 Test');
            expect(res.body.products[0].inventories[0].name).to.equal('Yellow');
            // expect(
            //   res.body.products[0].inventories[0].Inventory.ProductId
            // ).to.equal(res.body.products[0].inventories[0].ProductId);
            // expect(
            //   res.body.products[0].inventories[0].Inventory.ColorId
            // ).to.equal(res.body.products[0].inventories[0].id);
            // console.log('res.body.products[0]', res.body.products[0]);
            // console.log('res.body.products[0].inventories[0]', res.body.products[0].inventories[0]);
            // console.log('res.body.products[0].inventories[0].Inventory.ProductId', res.body.products[0].inventories[0].Inventory);
            expect(
              res.body.products[0].inventories[0].Inventory.quantity
            ).to.equal(20);
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });
});
