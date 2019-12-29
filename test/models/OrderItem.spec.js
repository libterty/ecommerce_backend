process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const OrderItemModel = require('../../models/orderitem');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# OrderItem Model', () => {
  const OrderItem = OrderItemModel(sequelize, dataTypes);
  checkModelName(OrderItem)('OrderItem');

  context('properties', () => {
    const orderItem = new OrderItem();
    ['price', 'quantity', 'OrderId', 'ProductId', 'ColorId'].forEach(
      checkPropertyExists(orderItem)
    );
  });

  context('associations', () => {
    const Order = 'Order';
    const Product = 'Product';
    const Color = 'Color';
    before(() => {
      OrderItem.associate({ Order });
      OrderItem.associate({ Product });
      OrderItem.associate({ Color });
    });

    it('should belong to one Order', done => {
      OrderItem.belongsTo.should.have.been.calledWith(Order);
      done();
    });

    it('should belong to one Product', done => {
      OrderItem.belongsTo.should.have.been.calledWith(Product);
      done();
    });

    it('should belong to one color', done => {
      OrderItem.belongsTo.should.have.been.calledWith(Color);
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
      db.OrderItem.create(requiredColumns)
        .then(orderItem => {
          data = orderItem;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.OrderItem.findByPk(data.id)
        .then(orderItem => {
          data.id.should.be.equal(orderItem.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.OrderItem.update({}, { where: { id: data.id } })
        .then(() => db.OrderItem.findByPk(data.id))
        .then(orderItem => {
          data.updatedAt.should.be.not.equal(orderItem.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.OrderItem.destroy({ where: { id: data.id } })
        .then(() => db.OrderItem.findByPk(data.id))
        .then(orderItem => {
          should.not.exist(orderItem);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
