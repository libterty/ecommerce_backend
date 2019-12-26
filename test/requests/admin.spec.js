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
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
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

  context('# Get Specific Product', () => {
    describe('When Visit Admin Product page', () => {
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
          price: 3000,
          CategoryId: 2
        });
        await db.Category.create({ name: '測試種類' });
        await db.Image.create({ url: 'test1.jpg', ProductId: 1 });
        await db.Color.create({ name: 'Yellow', ProductId: 1 });
        await db.Inventory.create({ quantity: 20, ProductId: 1, ColorId: 1 });
      });

      it('should create Category data', done => {
        db.Category.findAll().then(c => {
          expect(c).not.to.equal(null);
          return done();
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
        request(app)
          .get('/api/admin/products/1')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.product.name).to.equal('Product1 Test');
            expect(res.body.product.cost).to.equal(1500);
            expect(res.body.product.price).to.equal(3000);
            expect(res.body.product.Category.name).to.equal('測試種類');
            expect(res.body.product.Images[0].url).to.equal('test1.jpg');
            expect(res.body.product.inventories[0].name).to.equal('Yellow');
            expect(res.body.product.inventories[0].Inventory.quantity).to.equal(
              20
            );
            done();
          });
      });

      it('should return 400 when product is not exist', done => {
        request(app)
          .get('/api/admin/products/2')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Cannot find what you want');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
        await db.Category.destroy({ where: {}, truncate: true });
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
          .field('CategoryId', 1)
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
            colorName: 'Yellow',
            CategoryId: 1
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
            colorName: 'Yellow',
            CategoryId: 1
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
            colorName: 'Yellow',
            CategoryId: 1
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

  context('# Put Products', () => {
    describe('When update product models', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試',
          CategoryId: 1
        });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 400 when item is already exist in db', done => {
        request(app)
          .put(`/api/admin/products/${id}`)
          .send({ name: 'test1Item' })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Product is already exist');
            done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .put(`/api/admin/products/${id}`)
          .send({ name: 'newTest' })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Update Prodcut Success');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Post Colors', () => {
    describe('When update colors to existing products', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試'
        });
        await db.Color.create({ name: 'white', ProductId: 1 });
        await db.Inventory.create({ quantity: 32, ProductId: 1, ColorId: 2 });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 400 without any input', done => {
        request(app)
          .post(`/api/admin/products/colors`)
          .send({})
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal("required fields didn't exist");
            done();
          });
      });

      it('should return 400 when Color is already exist', done => {
        request(app)
          .post(`/api/admin/products/colors`)
          .send({ name: 'white', ProductId: 1 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Color is already exist');
            done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .post(`/api/admin/products/colors`)
          .send({ name: 'Black', ProductId: 1 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Create New Color');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Put Colors', () => {
    describe('When update colors to existing products', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試'
        });
        await db.Color.create({ name: 'white', ProductId: 1 });
        await db.Inventory.create({ quantity: 20, ColorId: 1, ProductId: 1 });
        await db.Color.create({ name: 'black', ProductId: 1 });
        await db.Inventory.create({ quantity: 13, ColorId: 2, ProductId: 1 });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 400 when no ProductId is set', done => {
        request(app)
          .put(`/api/admin/products/colors/3`)
          .send({})
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Something went wrong');
            done();
          });
      });

      it('should return 400 when no body is set', done => {
        request(app)
          .put(`/api/admin/products/colors/${id}`)
          .send({})
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Something went wrong');
            return done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .put(`/api/admin/products/colors/${id}`)
          .send({ name: 'yellow', ColorId: 2 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Inventory.findOne({ where: { ProductId: id, ColorId: 3 } }).then(
              inventory => {
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal('Revise Color Success 2');
                expect(inventory.dataValues.quantity).to.equal(13);
                return done();
              }
            );
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .put(`/api/admin/products/colors/${id}`)
          .send({ name: 'white', ColorId: 3 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Inventory.findOne({ where: { ProductId: id, ColorId: 1 } }).then(
              inventory => {
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal('Revise Color Success 1');
                expect(inventory.dataValues.quantity).to.equal(33);
                return done();
              }
            );
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Put Inventories', () => {
    describe('When update colors to existing products', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試'
        });
        await db.Color.create({ name: 'white', ProductId: 1 });
        await db.Inventory.create({ quantity: 20, ProductId: 1, ColorId: 1 });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 400 when Inventory quantity set to less then zero', done => {
        request(app)
          .put(`/api/admin/products/inventories/${id}`)
          .send({ quantity: -2 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'required field is less than zero'
            );
            done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .put(`/api/admin/products/inventories/${id}`)
          .send({ quantity: 32 })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Inventory.findByPk(id).then(i => {
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('Update Inventory');
              expect(i.dataValues.quantity).to.equal(32);
              return done();
            });
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Color.destroy({ where: {}, truncate: true });
        await db.Inventory.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Post new Images', () => {
    describe('When adding new Images for existing products', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試'
        });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 200 when create success', done => {
        request(app)
          .post(`/api/admin/products/images/${id}`)
          .set('Authorization', 'bearer ' + token)
          .field('Content-Type', 'multipart/form-data')
          .attach('url', 'upload/test2.jpg')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('create success');
            done();
          });
      });

      it('should return 400 when nothing to upload', done => {
        request(app)
          .post(`/api/admin/products/images/${id}`)
          .set('Authorization', 'bearer ' + token)
          .field('Content-Type', 'multipart/form-data')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('nothing to upload');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Product.destroy({ where: {}, truncate: true });
        await db.Image.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# delete Products', () => {
    describe('When update colors to existing products', () => {
      let token, id;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Product.create({
          name: 'test1Item',
          description: 'description',
          cost: 300,
          price: 3000,
          height: 30,
          width: 30,
          length: 30,
          weight: 15,
          material: '測試'
        });
        await db.Image.create({
          url: 'https://i.imgur.com/BYCQf4j.jpg',
          ProductId: 1
        });
        await db.Color.create({ name: 'white', ProductId: 1 });
        await db.Inventory.create({ quantity: 20, ProductId: 1, ColorId: 1 });
      });

      it('should have one data in Product model', done => {
        db.Product.findOne({ where: { name: 'test1Item' } }).then(product => {
          id = product.dataValues.id;
          return done();
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

      it('should return 400 when no product has found', done => {
        request(app)
          .delete(`/api/admin/products/2`)
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('nothing to delete');
            done();
          });
      });

      it('should return 200 with json data', done => {
        request(app)
          .delete(`/api/admin/products/${id}`)
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            db.Product.findByPk(id).then(p => {
              expect(p).to.equal(null);
              expect(res.body.status).to.equal('success');
              expect(res.body.message).to.equal('delete success');
              return done();
            });
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
