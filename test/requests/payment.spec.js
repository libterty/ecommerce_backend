process.env.NODE_ENV = 'test';

const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../index');
const bcrypt = require('bcryptjs');
const helpers = require('../../_helpers');
const should = chai.should();
const expect = chai.expect;
const db = require('../../models');

describe('# Payment Request', () => {
    context('# Create Payment', () => {
        before(async () => {
            let test1token;
            this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1 });
            await db.User.create({
                name: 'test1',
                email: 'test1@example.com',
                password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
                admin: false
            });
            await db.User.create({
                name: 'test2',
                email: 'test2@example.com',
                password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
                admin: false
            });
            await db.Order.create({
                sn: '',
                order_status: '訂單處理中',
                shipping_status: '未出貨',
                payment_status: '未付款',
                total_amount: '3000',
                name: 'test1',
                address: '測試路',
                email: process.env.testEmail,
                phone: '02-8888-8888',
                invoice: '',
                UserId: 1
            });
            await db.Shipping.create({
                sn: '',
                shipping_method: '黑貓宅急便',
                shipping_method: '未出貨',
                shipping_fee: 350,
                name: 'test1',
                address: '測試路',
                email: process.env.testEmail,
                phone: '02-8888-8888',
                OrderId: 1
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
                test1token = res.body.token;
                done();
            });
        });
    
        it('should return 401 when malware request', done => {
            request(app)
            .get('/api/orders/2')
            .set('Authorization', 'bearer ' + test1token)
            .set('Accept', 'application/json')
            .expect(401)
            .end((err, res) => {
                expect(res.body.status).to.equal('error');
                expect(res.body.message).to.equal('Can not find any user data');
                done();
            });
        });

        it('should return 200 when payment create success', done => {
            request(app)
            .get('/api/payments/1/users/1')
            .set('Authorization', 'bearer ' + test1token)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                expect(res.body.status).to.equal('success');
                expect(res.body.message).to.equal('Create payment success');
                done();
            });
        });

        after(async () => {
            this.getUser.restore();
            await db.User.destroy({ where: {}, truncate: true });
            await db.Order.destroy({ where: {}, truncate: true });
            await db.Shipping.destroy({ where: {}, truncate: true });
            await db.Payment.destroy({ where: {}, truncate: true });
        });
    });
});