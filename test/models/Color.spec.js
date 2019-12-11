process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ColorModel = require('../../models/Color');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Color Model', () => {
  const Color = ColorModel(sequelize, dataTypes);
  checkModelName(Color)('Color');

  context('properties', () => {
    const color = new Color();
    ['name'].forEach(checkPropertyExists(color));
  });

  context('associations', () => {
    const [OrderItem, CartItem, Product] = ['OrderItem', 'CartItem', 'Product'];

    before(() => {
      Color.associate({ OrderItem });
      Color.associate({ CartItem });
      Color.associate({ Product });
    });

    it('should have many orderItems', done => {
      Color.hasMany.should.have.been.calledWith(OrderItem);
      done();
    });

    it('should have many cartItems', done => {
      Color.hasMany.should.have.been.calledWith(CartItem);
      done();
    });

    it('should belong to many products', done => {
      Color.belongsToMany.should.have.been.calledWith(Product);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Color.create()
        .then(color => {
          data = color;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Color.findByPk(data.id)
        .then(color => {
          data.id.should.be.equal(color.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Color.update({}, { where: { id: data.id } })
        .then(() => db.Color.findByPk(data.id))
        .then(color => {
          data.updatedAt.should.be.not.equal(color.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Color.destroy({ where: { id: data.id } })
        .then(() => db.Color.findByPk(data.id))
        .then(color => {
          should.not.exist(color);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
