const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const app = require('../../index');
const should = chai.should();
const expect = chai.expect;
const email = require('../../util/email');
const db = require('../../models');

describe('# Email', () => {
  context('# When request to send email', () => {
    describe('User is clicking sending email button', () => {
      before(async () => {
        let token;
        await db.User.create({
          name: 'test1',
          email: 'test1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          admin: true
        });
      });

      it('should return 200 with admintoken', done => {
        request(app)
          .post('/api/signin')
          .send({ email: 'test1@example.com', password: '12345678' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            expect(res.body.status).to.equal('success');
            expect(res.body.token).not.to.equal(undefined);
            token = res.body.token;
            done();
          });
      });

      it('should return 200 and without fail', done => {
        request(app)
          .get('/api/admin/orders/test')
          .set('Authorization', 'bearer ' + token)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Send Email Success');
            done();
          });
      });

      after(async () => {
        await db.User.destroy({ where: {}, truncate: true });
      });
    });
  });
});
