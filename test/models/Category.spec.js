process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const CategoryModel = require('../../models/category');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Category Model', () => {
  const Category = CategoryModel(sequelize, dataTypes);
  checkModelName(Category)('Category');

  context('properties', () => {
    const category = new Category();
    ['name'].forEach(checkPropertyExists(category));
  });

  context('associations', () => {
    const Product = 'Product';

    before(() => {
        Category.associate({ Product });
    });

    it('should belong to one product', done => {
      Category.hasMany.should.have.been.calledWith(Product);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Category.create()
        .then(category => {
          data = category;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Category.findByPk(data.id)
        .then(category => {
          data.id.should.be.equal(category.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Category.update({}, { where: { id: data.id } })
        .then(() => db.Category.findByPk(data.id))
        .then(category => {
          data.updatedAt.should.be.not.equal(category.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Category.destroy({ where: { id: data.id } })
        .then(() => db.Category.findByPk(data.id))
        .then(Category => {
          should.not.exist(Category);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
