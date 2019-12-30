process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const PaymentModel = require('../../models/payment');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Payment Model', () => {
  const Payment = PaymentModel(sequelize, dataTypes);
  checkModelName(Payment)('Payment');

  context('properties', () => {
    const payment = new Payment();
    [
      'sn',
      'params',
      'total_amount',
      'payment_method',
      'payment_status',
      'paid_at',
      'OrderId'
    ].forEach(checkPropertyExists(payment));
  });

  context('associations', () => {
    const Order = 'Order';
    before(() => {
      Payment.associate({ Order });
    });

    it('should belong to one order', done => {
      Payment.belongsTo.should.have.been.calledWith(Order);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Payment.create()
        .then(payment => {
          data = payment;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Payment.findByPk(data.id)
        .then(payment => {
          data.id.should.be.equal(payment.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Payment.update({}, { where: { id: data.id } })
        .then(() => db.Payment.findByPk(data.id))
        .then(payment => {
          data.updatedAt.should.be.not.equal(payment.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Payment.destroy({ where: { id: data.id } })
        .then(() => db.Payment.findByPk(data.id))
        .then(payment => {
          should.not.exist(payment);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
