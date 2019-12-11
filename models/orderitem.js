'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      price: { type: DataTypes.FLOAT, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      OrderId: DataTypes.INTEGER,
      ProductId: DataTypes.INTEGER,
      ColorId: DataTypes.INTEGER
    },
    {}
  );
  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Color);
  };
  return OrderItem;
};
