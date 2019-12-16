process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ProductModel = require('../../models/product');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Product Model', () => {
  const Product = ProductModel(sequelize, dataTypes);
  checkModelName(Product)('Product');

  context('properties', () => {
    const product = new Product();
    [
      'name',
      'description',
      'price',
      'height',
      'length',
      'width',
      'weight',
      'material'
    ].forEach(checkPropertyExists(product));
  });

  context('associations', () => {
    const [Image, Order, Cart, Color] = ['Image', 'Order', 'Cart', 'Color'];

    before(() => {
      Product.associate({ Image });
      Product.associate({ Order });
      Product.associate({ Cart });
      Product.associate({ Color });
    });

    it('should have many images', done => {
      Product.hasMany.should.have.been.calledWith(Image);
      done();
    });

    it('should belong to many orders', done => {
      Product.belongsToMany.should.have.been.calledWith(Order);
      done();
    });

    it('should belong to many carts', done => {
      Product.belongsToMany.should.have.been.calledWith(Cart);
      done();
    });

    it('should belong to many colors', done => {
      Product.belongsToMany.should.have.been.calledWith(Color);
      done();
    });
  });

  context('action', () => {
    let data = null;
    const requiredColumns = {
      name: '',
      cost: 1,
      price: 1
    };
    it('create', done => {
      db.Product.create(requiredColumns)
        .then(product => {
          data = product;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Product.findByPk(data.id)
        .then(product => {
          data.id.should.be.equal(product.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Product.update({}, { where: { id: data.id } })
        .then(() => db.Product.findByPk(data.id))
        .then(product => {
          data.updatedAt.should.be.not.equal(product.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Product.destroy({ where: { id: data.id } })
        .then(() => db.Product.findByPk(data.id))
        .then(product => {
          should.not.exist(product);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
