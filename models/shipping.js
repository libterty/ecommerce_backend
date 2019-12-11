'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shipping = sequelize.define(
    'Shipping',
    {
      sn: DataTypes.INTEGER,
      shipping_method: DataTypes.STRING,
      shipping_status: DataTypes.STRING,
      shipping_fee: DataTypes.INTEGER,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      OrderId: DataTypes.INTEGER
    },
    {}
  );
  Shipping.associate = function(models) {
    Shipping.belongsTo(models.Order);
  };
  return Shipping;
};
