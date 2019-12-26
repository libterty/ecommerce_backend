'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      sn: DataTypes.INTEGER,
      order_status: DataTypes.STRING,
      shipping_status: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      total_amount: DataTypes.INTEGER,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      invoice: DataTypes.STRING,
      UserId: DataTypes.INTEGER
    },
    {}
  );
  Order.associate = function(models) {
    Order.belongsTo(models.User);
    Order.hasMany(models.Shipping);
    Order.hasMany(models.Payment);
    Order.belongsToMany(models.Product, {
      through: {
        model: models.OrderItem,
        unique: false
      },
      foreignKey: 'OrderId',
      as: 'items'
    });
  };
  return Order;
};
