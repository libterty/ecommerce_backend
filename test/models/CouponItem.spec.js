process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const CouponItemModel = require('../../models/couponitem');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# CouponItem Model', () => {
  const CouponItem = CouponItemModel(sequelize, dataTypes);
  checkModelName(CouponItem)('CouponItem');

  context('properties', () => {
    const couponItem = new CouponItem();
    ['UserId', 'CouponId'].forEach(checkPropertyExists(couponItem));
  });
  context('associations', () => {
    const [Coupon] = ['Coupon'];
    before(() => {
      CouponItem.associate({ Coupon });
    });

    it('should belong to many coupons', done => {
      CouponItem.belongsTo.should.have.been.calledWith(Coupon);
      done();
    });
  });
  context('action', () => {
    let data = null;
    it('create', done => {
      db.CouponItem.create()
        .then(couponItem => {
          console.log(couponItem);
          data = couponItem;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });
    it('read', done => {
      db.CouponItem.findByPk(data.id)
        .then(couponItem => {
          data.id.should.be.equal(couponItem.id);
          done();
        })
        .catch(error => console.log(error));
    });
    it('update', done => {
      db.CouponItem.update({}, { where: { id: data.id } })
        .then(() => db.CouponItem.findByPk(data.id))
        .then(couponItem => {
          data.updatedAt.should.be.not.equal(couponItem.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });
    it('delete', done => {
      db.CouponItem.destroy({ where: { id: data.id } })
        .then(() => db.CouponItem.findByPk(data.id))
        .then(couponItem => {
          should.not.exist(couponItem);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
