process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const OrderModel = require('../../models/order');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Order Model', () => {
  const Order = OrderModel(sequelize, dataTypes);
  checkModelName(Order)('Order');

  context('properties', () => {
    const order = new Order();
    [
      'sn',
      'order_status',
      'shipping_status',
      'payment_status',
      'total_amount',
      'name',
      'address',
      'email',
      'phone',
      'invoice',
      'UserId'
    ].forEach(checkPropertyExists(order));
  });

  context('associations', () => {
    const [User, Shipping, Payment, Product, OrderItem] = [
      'User',
      'Shipping',
      'Payment',
      'Product',
      'OrderItem'
    ];
    before(() => {
      Order.associate({ User });
      Order.associate({ Shipping });
      Order.associate({ Payment });
      Order.associate({ Product });
      Order.associate({ OrderItem });
    });

    it('should belong to one user', done => {
      Order.belongsTo.should.have.been.calledWith(User);
      done();
    });

    it('should have many shippings', done => {
      Order.hasMany.should.have.been.calledWith(Shipping);
      done();
    });

    it('should have many payments', done => {
      Order.hasMany.should.have.been.calledWith(Payment);
      done();
    });

    it('should belong to many products', done => {
      Order.belongsToMany.should.have.been.calledWith(Product);
      done();
    });

    it('should have many OrderItem', done => {
      Order.hasMany.should.have.been.calledWith(OrderItem);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Order.create()
        .then(order => {
          data = order;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Order.findByPk(data.id)
        .then(order => {
          data.id.should.be.equal(order.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Order.update({}, { where: { id: data.id } })
        .then(() => db.Order.findByPk(data.id))
        .then(order => {
          data.updatedAt.should.be.not.equal(order.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Order.destroy({ where: { id: data.id } })
        .then(() => db.Order.findByPk(data.id))
        .then(order => {
          should.not.exist(order);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
