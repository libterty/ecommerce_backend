process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const CartItemModel = require('../../models/cartItem');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# CartItem Model', () => {
  const CartItem = CartItemModel(sequelize, dataTypes);
  checkModelName(CartItem)('CartItem');

  context('properties', () => {
    const cartItem = new CartItem();
    ['price', 'quantity', 'CartId', 'ProductId', 'ColorId'].forEach(
      checkPropertyExists(cartItem)
    );
  });

  context('associations', () => {
    const [Cart, Product, Color] = ['Cart', 'Product', 'Color'];
    before(() => {
      CartItem.associate({ Cart });
      CartItem.associate({ Product });
      CartItem.associate({ Color });
    });

    it('should belong to one cart', done => {
      CartItem.belongsTo.should.have.been.calledWith(Cart);
      done();
    });

    it('should belong to one product', done => {
      CartItem.belongsTo.should.have.been.calledWith(Product);
      done();
    });

    it('should belong to one color', done => {
      CartItem.belongsTo.should.have.been.calledWith(Color);
      done();
    });
  });

  context('action', () => {
    let data = null;
    const requiredColumns = {
      quantity: 1,
      price: 1
    };
    it('create', done => {
      db.CartItem.create(requiredColumns)
        .then(cartItem => {
          data = cartItem;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.CartItem.findByPk(data.id)
        .then(cartItem => {
          data.id.should.be.equal(cartItem.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.CartItem.update({}, { where: { id: data.id } })
        .then(() => db.CartItem.findByPk(data.id))
        .then(cartItem => {
          data.updatedAt.should.be.not.equal(cartItem.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.CartItem.destroy({ where: { id: data.id } })
        .then(() => db.CartItem.findByPk(data.id))
        .then(cartItem => {
          should.not.exist(cartItem);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
