process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const CartModel = require('../../models/cart');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Cart Model', () => {
  const Cart = CartModel(sequelize, dataTypes);
  checkModelName(Cart)('Cart');

  context('properties', () => {
    const cart = new Cart();
    [].forEach(checkPropertyExists(cart));
  });

  context('associations', () => {
    const Product = 'Product';
    const CartItem = 'CartItem';
    before(() => {
      Cart.associate({ Product });
      Cart.associate({ CartItem });
    });

    it('should belong to many products', done => {
      Cart.belongsToMany.should.have.been.calledWith(Product);
      done();
    });

    it('should has many CartItem', done => {
      Cart.hasMany.should.have.been.calledWith(CartItem);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Cart.create()
        .then(cart => {
          data = cart;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Cart.findByPk(data.id)
        .then(cart => {
          data.id.should.be.equal(cart.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Cart.update({}, { where: { id: data.id } })
        .then(() => db.Cart.findByPk(data.id))
        .then(cart => {
          data.updatedAt.should.be.not.equal(cart.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Cart.destroy({ where: { id: data.id } })
        .then(() => db.Cart.findByPk(data.id))
        .then(cart => {
          should.not.exist(cart);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
