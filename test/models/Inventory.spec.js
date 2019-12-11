process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const db = require('../../models');
const InventoryModel = require('../../models/inventory');
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

chai.use(require('sinon-chai'));

describe('# Inventory Model', () => {
  const Inventory = InventoryModel(sequelize, dataTypes);
  checkModelName(Inventory)('Inventory');

  context('properties', () => {
    const inventory = new Inventory();
    ['quantity', 'ProductId', 'ColorId'].forEach(
      checkPropertyExists(inventory)
    );
  });

  context('associations', () => {
    const [Product, Color] = ['Product', 'Color'];
    before(() => {
      Inventory.associate({ Product });
      Inventory.associate({ Color });
    });

    it('should belong to one product', done => {
      Inventory.belongsTo.should.have.been.calledWith(Product);
      done();
    });

    it('should belong to one color', done => {
      Inventory.belongsTo.should.have.been.calledWith(Color);
      done();
    });
  });

  context('action', () => {
    let data = null;

    it('create', done => {
      db.Inventory.create()
        .then(inventory => {
          data = inventory;
          should.exist(data);
          done();
        })
        .catch(error => console.log(error));
    });

    it('read', done => {
      db.Inventory.findByPk(data.id)
        .then(inventory => {
          data.id.should.be.equal(inventory.id);
          done();
        })
        .catch(error => console.log(error));
    });

    it('update', done => {
      db.Inventory.update({}, { where: { id: data.id } })
        .then(() => db.Inventory.findByPk(data.id))
        .then(inventory => {
          data.updatedAt.should.be.not.equal(inventory.updatedAt);
          done();
        })
        .catch(error => console.log(error));
    });

    it('delete', done => {
      db.Inventory.destroy({ where: { id: data.id } })
        .then(() => db.Inventory.findByPk(data.id))
        .then(inventory => {
          should.not.exist(inventory);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
