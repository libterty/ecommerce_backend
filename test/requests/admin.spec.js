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
        await db.Image.create({ url: 'test1.jpg', ProductId: 2 });
        await db.Image.create({ url: 'test2.jpg', ProductId: 3 });
        await db.Color.create({ name: 'Yellow', ProductId: 2 });
        await db.Color.create({ name: 'Black', ProductId: 3 });
        await db.Inventory.create({ quantity: 20, ProductId: 2, ColorId: 2 });
        await db.Inventory.create({ quantity: 10, ProductId: 3, ColorId: 3 });
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
            expect(
              res.body.products[0].inventories[0].Inventory.ProductId
            ).to.equal(res.body.products[0].inventories[0].ProductId);
            expect(
              res.body.products[0].inventories[0].Inventory.ColorId
            ).to.equal(res.body.products[0].inventories[0].id);
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

  context('# Post Products', () => {
    describe('When Create New Product', () => {
      let token;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
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
        const body = {
          name: 'test2Item',
          description: 'test description',
          cost: 200,
          price: 300,
          height: 38,
          width: 30,
          length: 381,
          weight: 3,
          material: 'test',
          quantity: 39,
          colorName: 'Black'
        };
        request(app)
          .post('/api/admin/products')
          .set('Authorization', 'bearer ' + token)
          .field('Content-Type', 'multipart/form-data')
          .field('name', 'test2Item')
          .field('description', 'test description')
          .field('cost', 200)
          .field('price', 300)
          .field('height', 38)
          .field('width', 30)
          .field('length', 381)
          .field('weight', 15)
          .field('material', '測試系列')
          .field('quantity', 15)
          .field('colorName', 'Yellow')
          .attach('url', 'upload/test.jpg')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('create success');
            done();
          });
      });

      it('should return 400 when input is insufficient', done => {
        request(app)
          .post('/api/admin/products')
          .send({
            name: '',
            description: '',
            cost: 300,
            price: 3000,
            height: 30,
            width: 30,
            length: 30,
            weight: 15,
            material: '測試',
            quantity: 300,
            colorName: 'Yellow'
          })
          .set('Authorization', 'bearer ' + token)
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("required fields didn't exist");
            done();
          });
      });

      it('should return 200 with Json Data', done => {
        request(app)
          .post('/api/admin/products')
          .send({
            name: 'test1Item',
            description: 'description',
            cost: 300,
            price: 3000,
            height: 30,
            width: 30,
            length: 30,
            weight: 15,
            material: '測試',
            quantity: 300,
            colorName: 'Yellow'
          })
          .set('Authorization', 'bearer ' + token)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            db.Product.findOne({ where: { name: 'test1Item' } }).then(
              async product => {
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal(
                  'create without Product Image'
                );
                expect(product.dataValues.cost).to.equal(300);
                expect(product.dataValues.price).to.equal(3000);
                const dbColorRes = await db.Color.findOne({
                  where: { ProductId: product.dataValues.id }
                });
                const dbInventoryRes = await db.Inventory.findOne({
                  where: { ProductId: product.dataValues.id }
                });
                expect(dbColorRes.dataValues.name).to.equal('Yellow');
                expect(dbInventoryRes.dataValues.quantity).to.equal(300);
                return done();
              }
            );
          });
      });

      it('should return 400 when db has already have this item', done => {
        request(app)
          .post('/api/admin/products')
          .send({
            name: 'test1Item',
            description: 'description',
            cost: 300,
            price: 3000,
            height: 30,
            width: 30,
            length: 30,
            weight: 15,
            material: '測試',
            quantity: 300,
            colorName: 'Yellow'
          })
          .set('Authorization', 'bearer ' + token)
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Product is already exist');
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
