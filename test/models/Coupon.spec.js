process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const CouponModel = require('../../models/coupon');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Coupon Model', () => {
  const Coupon = CouponModel(sequelize, dataTypes);
  checkModelName(Coupon)('Coupon');

  context('properties', () => {
    const coupon = new Coupon();
    ['coupon_code', 'limited_usage', 'expire_date', 'percent'].forEach(
      checkPropertyExists(coupon)
    );
  });

  context('associations', () => {
    const [User] = ['User'];

    before(() => {
      Coupon.associate({ User });
    });

    it('should belong to many users', done => {
      Coupon.belongsToMany.should.have.been.calledWith(User);
      done();
    });
  });
  context('action', () => {
    let data = null;
    const requiredColumns = {
      coupon_code: 'EVENAq4'
    };
    it('create', done => {
      db.Coupon.create(requiredColumns)
        .then(coupon => {
          data = coupon;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });
    it('read', done => {
      db.Coupon.findByPk(data.id)
        .then(coupon => {
          data.id.should.be.equal(coupon.id);
          done();
        })
        .catch(error => console.log(error));
    });
    it('update', done => {
      db.Coupon.update({}, { where: { id: data.id } })
        .then(() => db.Coupon.findByPk(data.id))
        .then(coupon => {
          data.updatedAt.should.be.not.equal(coupon.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });
    it('delete', done => {
      db.Coupon.destroy({ where: { id: data.id } })
        .then(() => db.Coupon.findByPk(data.id))
        .then(coupon => {
          should.not.exist(coupon);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
