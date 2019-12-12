'use strict';

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      CartId: DataTypes.INTEGER,
      ProductId: DataTypes.INTEGER,
      ColorId: DataTypes.INTEGER
    },
    {}
  );
  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart);
    CartItem.belongsTo(models.Product);
    CartItem.belongsTo(models.Color);
  };
  return CartItem;
};
