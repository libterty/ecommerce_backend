process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const ImageModel = require('../../models/image');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Image Model', () => {
  const Image = ImageModel(sequelize, dataTypes);
  checkModelName(Image)('Image');

  context('properties', () => {
    const image = new Image();
    ['url', 'ProductId'].forEach(checkPropertyExists(image));
  });

  context('associations', () => {
    const Product = 'Product';

    before(() => {
      Image.associate({ Product });
    });

    it('should belong to one product', done => {
      Image.belongsTo.should.have.been.calledWith(Product);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Image.create()
        .then(image => {
          data = image;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Image.findByPk(data.id)
        .then(image => {
          data.id.should.be.equal(image.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Image.update({}, { where: { id: data.id } })
        .then(() => db.Image.findByPk(data.id))
        .then(image => {
          data.updatedAt.should.be.not.equal(image.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Image.destroy({ where: { id: data.id } })
        .then(() => db.Image.findByPk(data.id))
        .then(image => {
          should.not.exist(image);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
