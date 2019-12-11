process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const UserModel = require('../../models/user');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# User Model', () => {
  const User = UserModel(sequelize, dataTypes);
  checkModelName(User)('User');

  context('properties', () => {
    const user = new User();
    [
      'name',
      'email',
      'password',
      'birthday',
      'admin',
      'avatar',
      'address',
      'tel',
      'role'
    ].forEach(checkPropertyExists(user));
  });

  context('associations', () => {
    const Order = 'Order';
    before(() => {
      User.associate({ Order });
    });

    it('should have many orders', done => {
      User.hasMany.should.have.been.calledWith(Order);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.User.create()
        .then(user => {
          data = user;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.User.findByPk(data.id)
        .then(user => {
          data.id.should.be.equal(user.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.User.update({}, { where: { id: data.id } })
        .then(() => db.User.findByPk(data.id))
        .then(user => {
          data.updatedAt.should.be.not.equal(user.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.User.destroy({ where: { id: data.id } })
        .then(() => db.User.findByPk(data.id))
        .then(user => {
          should.not.exist(user);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
