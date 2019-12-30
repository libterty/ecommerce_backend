process.env.NODE_ENV = 'test';
const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Admin Coupon Request', () => {
  context('# Get All Coupons', () => {
    describe('When Visit Admin Coupon Page', () => {
      let token;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'admin',
          email: 'adminTest@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
        await db.Coupon.create({
          id: 2,
          coupon_code: 'BIGSELL',
          limited_usage: 1,
          expire_date: '2020/02/20',

          percent: 20
        });
      });
      it('should get all coupons and return with 200 status', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'adminTest@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .get('/api/admin/coupons')
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal('Got all coupons');
                expect(res.body.coupons[0].coupon_code).to.equal(
                  'HUGEDISCOUNT'
                );
                expect(res.body.coupons[1].coupon_code).to.equal('BIGSELL');
                done();
              });
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });
  context('# Get Specific Coupon', () => {
    describe('When visit specific coupon page', () => {
      let token;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'admin',
          email: 'adminTest@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
      });
      it('should return status 200 with specific coupon JSON data', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'adminTest@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .get('/api/admin/coupons/1')
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.equal('success');
                expect(res.body.coupon.coupon_code).to.equal('HUGEDISCOUNT');
                done();
              });
          });
      });
      it('should return status 400 when coupon is not exist', done => {
        request(app)
          .get('/api/admin/coupons/4')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Can not fetch coupon info');
            done();
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Post Coupon', () => {
    describe('When Create New Coupon', () => {
      let token;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'admin',
          email: 'adminTest@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
      });
      it('should return 400 status when missing required fields', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'adminTest@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .post('/api/admin/coupons')
              .send({ limitedUsage: 1, couponCode: 'HOORAY', percent: 95 })
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(400)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.equal('error');
                expect(res.body.message).to.equal('All fields are required');
                done();
              });
          });
      });
      it('should return error status when coupon code exists', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: 1,
            couponCode: 'HUGEDISCOUNT',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Coupon code already existed');
            done();
          });
      });
      it('should automatic generate a coupon code when missing coupon code field', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: 1,
            couponCode: '',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('generate a coupon code');
            expect(res.body.generateCode).not.to.equal(undefined);
            done();
          });
      });
      it('should return error when percent is smaller than 1', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY3',
            expireDate: '2020-10-14',
            percent: ''
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Percentage of discount must greater than 1'
            );
            done();
          });
      });
      it('should return error when limitedUsage is smaller than 1', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: -1,
            couponCode: 'HOORAY4',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Number of coupon usage at least to be 1'
            );
            done();
          });
      });
      it('should return error when expireDate is already passed', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY5',
            percent: 95,
            expireDate: '2019-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Expire date must more than the time from now'
            );
            done();
          });
      });
      it('should return 200 and success status', done => {
        request(app)
          .post('/api/admin/coupons')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY7',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Created coupon successfully');
            done();
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });
  context('# Update Specific Coupon', () => {
    describe('When update specific coupon', () => {
      let token;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'admin',
          email: 'adminTest@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
      });
      it('should return 400 status when missing required fields', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'adminTest@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .put('/api/admin/coupons/1')
              .send({ limitedUsage: 1, percent: 95 })
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(400)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.equal('error');
                expect(res.body.message).to.equal('All fields are required');
                done();
              });
          });
      });
      it('should return error status when coupon not exists', done => {
        request(app)
          .put('/api/admin/coupons/5')
          .send({
            limitedUsage: 1,
            couponCode: 'ABCD',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Coupon is not exist');
            done();
          });
      });

      it('should return error when percent smaller than 1', done => {
        request(app)
          .put('/api/admin/coupons/1')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY3',
            expireDate: '2020-10-14',
            percent: 0
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Percentage of discount must greater than 1'
            );
            done();
          });
      });
      it('should return error when limitedUsage is smaller than 1', done => {
        request(app)
          .put('/api/admin/coupons/1')
          .send({
            limitedUsage: -1,
            couponCode: 'HOORAY4',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Number of coupon usage at least to be 1'
            );
            done();
          });
      });
      it('should return error when expireDate is already passed', done => {
        request(app)
          .put('/api/admin/coupons/1')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY5',
            percent: 95,
            expireDate: '2019-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal(
              'Expire date must more than the time from now'
            );
            done();
          });
      });
      it('should return 200 and success status', done => {
        request(app)
          .put('/api/admin/coupons/1')
          .send({
            limitedUsage: 1,
            couponCode: 'HOORAY7',
            percent: 95,
            expireDate: '2020-10-14'
          })
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal(
              'Updated coupon data successfully'
            );
            done();
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });
  context('# Delete Specific Coupon', () => {
    describe('when delete specific coupon', () => {
      let token, id;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.CouponItem.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'admin',
          email: 'adminTest@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: true
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'OHYA',
          limited_usage: 1,
          expire_date: '2020/03/20'
        });
        await db.CouponItem.create({
          CouponId: 1,
          UserId: 1
        });
      });
      it('should have one data in Coupon model', done => {
        db.Coupon.findOne({ where: { coupon_code: 'OHYA' } }).then(coupon => {
          id = coupon.dataValues.id;
          return done();
        });
      });
      it('should have one data in CouponItem model', done => {
        db.CouponItem.findOne({ where: { UserId: 1 } }).then(() => {
          return done();
        });
      });
      it('should delete coupon and return success', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'adminTest@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .delete(`/api/admin/coupons/${id}`)
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                db.Coupon.findByPk(id).then(coupons => {
                  expect(res.body.status).to.equal('success');
                  expect(res.body.message).to.equal(
                    'Delete coupon successfully'
                  );
                  expect(coupons).to.equal(null);
                  return done();
                });
              });
          });
      });
      it('should not delete coupon and return error', done => {
        request(app)
          .delete('/api/admin/coupons/3')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Not able to delete coupon');
            return done();
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.CouponItem.destroy({ where: {}, truncate: true });
      });
    });
  });
});

describe('# User Coupon Request', () => {
  context('# Get All Coupons', () => {
    describe('When Visit User Coupon Page', () => {
      let token;
      before(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.CouponItem.destroy({ where: {}, truncate: true });
        await db.User.create({
          name: 'user',
          email: 'user@example.com',
          password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null),
          admin: false
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
        await db.Coupon.create({
          id: 2,
          coupon_code: 'BIGSELL',
          limited_usage: 1,
          expire_date: '2020/02/20',
          percent: 20
        });
        await db.CouponItem.create({
          CouponId: 1,
          UserId: 1
        });
        await db.CouponItem.create({
          CouponId: 2,
          UserId: 1
        });
        await db.CouponItem.create({
          CouponId: 3,
          UserId: 1
        });
      });
      it('should get all coupons and return with 200 status', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'user@example.com', password: '123456' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            request(app)
              .get('/api/users/coupons')
              .set('Authorization', 'bearer ' + token)
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal('Got coupons successfully');
                expect(res.body.userCoupons).not.to.equal(undefined);
                expect(res.body.userCoupons[0].coupon_code).to.equal(
                  'HUGEDISCOUNT'
                );
                expect(res.body.userCoupons[1].coupon_code).to.equal('BIGSELL');

                done();
              });
          });
      });
      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
        await db.CouponItem.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Get All Valid Coupons', () => {
    describe('When User Visit Order Page', () => {
      let token;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
        await db.Coupon.create({
          id: 2,
          coupon_code: 'BIGSELL',
          limited_usage: 1,
          expire_date: '2019/02/20',
          percent: 20
        });
      });

      it('should return 200 and test1 token', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            token = res.body.token;
            done();
          });
      });

      it('should return 200 and get valid coupons', done => {
        request(app)
          .get('/api/orders/coupons')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.coupons.length).to.equal(1);
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });

  context('# Put Valid Coupons', () => {
    describe('When User Request to use Coupons on Order Page', () => {
      let token;
      before(async () => {
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: false
        });
        await db.Coupon.create({
          id: 1,
          coupon_code: 'HUGEDISCOUNT',
          limited_usage: 1,
          expire_date: '2020/03/20',
          percent: 40
        });
        await db.Coupon.create({
          id: 2,
          coupon_code: 'BIGSELL',
          limited_usage: 1,
          expire_date: '2019/02/20',
          percent: 20
        });
      });

      it('should return 200 and test1 token', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            token = res.body.token;
            done();
          });
      });

      it('should return 200 and use valid coupons', done => {
        request(app)
          .get('/api/orders/coupons/1')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Use coupon success');
            done();
          });
      });

      it('should return 404 when no valid coupons', done => {
        request(app)
          .get('/api/orders/coupons')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(404)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('No coupons available now');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
        await db.Coupon.destroy({ where: {}, truncate: true });
      });
    });
  });
});
