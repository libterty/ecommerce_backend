'use strict';
module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      quantity: DataTypes.STRING,
      ProductId: DataTypes.INTEGER,
      ColorId: DataTypes.INTEGER
    },
    {}
  );
  Inventory.associate = function(models) {
    Inventory.belongsTo(models.Product);
    Inventory.belongsTo(models.Color);
  };

  return Inventory;
};
