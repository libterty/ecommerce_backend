process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ShippingModel = require('../../models/shipping');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Shipping Model', () => {
  const Shipping = ShippingModel(sequelize, dataTypes);
  checkModelName(Shipping)('Shipping');

  context('properties', () => {
    const shipping = new Shipping();
    [
      'sn',
      'shipping_method',
      'shipping_status',
      'shipping_fee',
      'name',
      'address',
      'email',
      'phone',
      'OrderId'
    ].forEach(checkPropertyExists(shipping));
  });

  context('associations', () => {
    const Order = 'Order';
    before(() => {
      Shipping.associate({ Order });
    });

    it('should belong to one order', done => {
      Shipping.belongsTo.should.have.been.calledWith(Order);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Shipping.create()
        .then(shipping => {
          data = shipping;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Shipping.findByPk(data.id)
        .then(shipping => {
          data.id.should.be.equal(shipping.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Shipping.update({}, { where: { id: data.id } })
        .then(() => db.Shipping.findByPk(data.id))
        .then(shipping => {
          data.updatedAt.should.be.not.equal(shipping.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Shipping.destroy({ where: { id: data.id } })
        .then(() => db.Shipping.findByPk(data.id))
        .then(shipping => {
          should.not.exist(shipping);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
