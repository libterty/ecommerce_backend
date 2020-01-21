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
        shipping_status: '未出貨',
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

  context('# When Call the spgatewayCallback', () => {
    describe('When user has submit payment in third party', () => {
      before(async () => {
        await db.Order.create({
          sn: '1578239501095',
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
          sn: '1578239501095',
          shipping_method: '黑貓宅急便',
          shipping_status: '未出貨',
          shipping_fee: 350,
          name: 'test1',
          address: '測試路',
          email: process.env.testEmail,
          phone: '02-8888-8888',
          OrderId: 1
        });
        await db.Payment.create({
          sn: '1578239501095',
          shipping_method: '黑貓宅急便',
          shipping_status: '未出貨',
          shipping_fee: 350,
          name: 'test1',
          address: '測試路',
          email: process.env.testEmail,
          phone: '02-8888-8888',
          OrderId: 1
        });
        await db.Order.create({
          sn: '1579595181835',
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
          sn: '1579595181835',
          shipping_method: '黑貓宅急便',
          shipping_status: '未出貨',
          shipping_fee: 350,
          name: 'test1',
          address: '測試路',
          email: process.env.testEmail,
          phone: '02-8888-8888',
          OrderId: 1
        });
        await db.Payment.create({
          sn: '1579595181835',
          shipping_method: '黑貓宅急便',
          shipping_status: '未出貨',
          shipping_fee: 350,
          name: 'test1',
          address: '測試路',
          email: process.env.testEmail,
          phone: '02-8888-8888',
          OrderId: 1
        });
      });

      it('Should return 401 when passing malware request', done => {
        request(app)
          .post('/api/spgateway/callback')
          .send({
            TradeInfo:
              '88b393620deb5df40c385e44d25d9f60b88cbea2fcb1ecdb305c67d921ef2a718958deec420464e5cdaf482a57fc3f0f3d18f1e691cb546e2b245d60706b96d6ccf03cb091f67580e9d6f3b0cf9454addd19d0001c3fe6ef1f55d8b968b9d98b89759840c2d2b056c1b60ac32ad5b77f63ca46088efb6f276373a1033d13350d97dbdb9bc9f91f66407b46885dae246ee6ec43ca017c71c0f69845a1a2b66d80f82fcf5d73dbd7efff1b88e5e9059a955e677bd5a74d0da91728bc3e981b1fba34863eeb7b6c2113efd6bca78f13f2a90e3d88d2b01b0822d7fae1eb4518ff18afba1007adc90611935c9589636ea68727e71cc3f1e990723ad57abfa52aaefab895ee68ffb19881e57510f351ae6b0eb476f48d834a720e5977598a68cc0775758592493ecaf9608738ca0586d5b767b31701be46b0822e23e29a795e4d00e8f4b0a869cb5592875839a6c62fae9f9f093f00fd918a44c06c3e92ecbe9cdebc0e0feaca4b409b93b4926b77a6108118a4a3dbddd894dcf0a100571d888cbd6f012640bc58b63163dd4bd421b8f48cf004f7dbd7d61ac638d6d9bd8c587a79096543bc84ffb57faa1fb18cd30f5dd60ddfd064b65db1be8a59008b6aff4d15759e1b7377204b3ba2697ca59856e365382586fe2e8bdf87f91d069d3f14fc19178366ae08c6932e35b01ecc0b02d179995d6e13df6adbe71c249c1e89a7033e35d1902d74de193726dfe87980c496a2efd405b188474baee882981c12b843880fb38ada28aa43034ef51d8e33223ee91bdefff28c25b459ddfc676569c86321af035a5de50b1ab3a62f8797145e0d39e9f788c8cc87afc8b56a73ca832af9dabdf6c2f8b44c960183b0f36b28ca5423bde81be4efcad6bc6b3635494d98b9f413c7539134855477af0a52b388a86d1bba1f773301e3918b812ee5ee3b2f1dfc2d759f19b6f11d290bd305921dce9795ae9dc3d7cb8dd8c5e7749f35107403f71ffd5cd731b73bdc72f9428bbf28291aa328d6cc848ba67cceb1c2c0da2cd98382ea30aed86c7d8f2d67c6848b272145dadf0d5e6deda27664c44c8950b6e3caae4b65b5c129a82d5cb310f7331283116b112dea46901de95401e5ca98a0876d87034cf54eb757ed67b0ef62d6c82ab8cfee306275e119e0e5f6c7570a51afe81ac73213cff9ff6f06547f6d7e558ba1893ea5dec08b54e780b2e6945c1c4e0258b4f8782cf0175613bb8b3aaed9b44bfed007a2e594cc6f531a8919b608a75de5ce074038fde481ea08da7f28eeba964fd0061d69d0cd9b8c29913251a6ce71c99457ee5354fd7ac2b7ab9c3f3f204224f3105ec3cec825f4de6e7a0574cf3be67f811746997cdc95cf06a31291b73eb27d857253ac452811d8465181ae7611b4816ef29d30a15dc8d0e2e79b0743aa3717ae5affa566a97493af3390a5b9b6f33ade0d5539eaf78d1299fc74d006ca7c5bfca6bd98a3727f72df1a119cf7a327bca034ed50bd8415b883489ed0ef301fa682a2e2ea78bbe9af8bdfe3a9f22b6d234c249c65108e612ed90f0be0ec79303a2a0ef3833879a4923e016e8637586a16ecf372987fe4c5852dec81940708305b7f68928f2a7fcc5b124a6c05e4d93d3a9da3cf3922761926cbd8452d0d8d50bd5375b1e35a11fe1b371c4b2cebe5b68ffc91b0ab79d3fa676ec2b02d11f4ee8347347e6f049f513014b0bfe98479318b08b30e7932b72a65f5fd2c171d7ddabc7e66b024928fbc79ca46fe5cbdeb61'
          })
          .set('Accept', 'application/json')
          .expect(401)
          .end((err, res) => {
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Something went wrong');
            done();
          });
      });

      it('Should return 302 when receiving data', done => {
        request(app)
          .post('/api/spgateway/callback')
          .send({
            TradeInfo:
              '70bf72c741a9d11c3bb996cb4fcb52bff46308cf40c6eabd6df1ecadda278d614eea03fbb33551fd5c9838e37d041390673981cf5e566d2530acb9733bc1fac28f2fe02c81b969fd80472b1e42e468f7ee6fe255c6ba2845062e77e346fc2af39a29776e2faa562691bbf137a69a9ae3fedb40931f3bbd254cbe8372d80931f897fe3e446e8473ae4238578fc01f96cc59ab3bd7c1d99a0d495a4f9207c5d34bfec539b75dc5bb0dca7e2765a07a01edeba6292e7d81a2cdc3c0afc685df993ae73a714046182a2553dd1d0f6114a97a13cbbe629974b3e5b445c25fac558fc259b8bc98a5e1d260204041af41c4e64893cd46b8d34233457f50f203018b04636fb1f730006e0c047e385d0806c1b755007090278be1861515e19136bbeed9bc04891bb534e469623fe7521a9910d594cb0dc4a3770e521e885d5af150ac59696256d030030a2abf91006ddba7b14aa25fa1b17b44b0ecfa5646e3964511006846f6ef714a1b51c5de78b277ea7b9b370ef19132f77a2fdffeaf64acef520f32397a722d39937b268febd1decccc0d5940abd7efc89bcd4438ed9b4105ff83e7a175b6e921c59493ee9be320a39c468298a4f9d720f8d0bc1e3700eed2c2b650184fd3df1bcd4edf257c7470e8bf9c1d832a800f074fdf58d9abc02aa2b9d1e7'
          })
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            db.Payment.findByPk(1).then(payment => {
              expect(payment.dataValues.payment_status).to.equal('已付款');
              return done();
            });
          });
      });

      it('Should return 302 when receiving data', done => {
        request(app)
          .post('/api/spgateway/callback')
          .send({
            TradeInfo:
              'cf5e436fff3e719591a4f90b96dc8e4d60efe56826d57794bbda90df02298b0f86cb6a19c3a1c7f4087bc6eedaa86844d1322bc35391090a90d70b959f81f524a17edd513f8136171846f369c247eaef32bc34eb55cccadcc5067b686b11096ec16808f14052993e2153443cbe1c273940e222ebfeec14368f3aecf4e2b846f0ab54826b1b493aa3c725d05f7f5d9f08d8c4235428cdbd03458238c005e2cfbc91302d95e7c99289afa4dc94203a29ee866d270c8c7466c7d5489294c7001c91af27de9633ab4606bbe527efcdef9625fc105a23bb79b736fefe727182673a5210497c3e570232769de98ab46ad7ed0a365187d7175dba0c5c8b76cdcc661860b7e457c6116a6034cbe31233d4eb52c1d4169f708c4966e6482a3067f4c98455a907d6091281119f52c16b35ac994ff87127103b3e403a4fcbb77b0c61b42ceab3528efb67f0aa183c45230bf5c544d79f2a401d3e61824156f95edb8168fc7f5e18e544a1aa7ef7e13ea4df05b0bbccc1e9b7291c5adf39dbc426af580b45aa063ff5f9574014b6f041b27d2c7bd6ed5383e91f6ba6236ac2d3ad41af7db5693158f63468aaa5ac8fa2c099a8bdfec55c7a98b40613e6588ab28878cfdf788979505054f4854a65c8ce85cef3923a8121cdc8adfeccc919fd66757a20544ee1bc466cc364bf3ee2f95acde678234522885666f47f6e036fd2874e02cb626b23'
          })
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            db.Payment.findByPk(2).then(payment => {
              expect(payment.dataValues.payment_status).to.equal('付款失敗');
              return done();
            });
          });
      });

      after(async () => {
        await db.Order.destroy({ where: {}, truncate: true });
        await db.Shipping.destroy({ where: {}, truncate: true });
        await db.Payment.destroy({ where: {}, truncate: true });
      });
    });
  });
});
