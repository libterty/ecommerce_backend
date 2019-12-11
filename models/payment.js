'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      sn: DataTypes.INTEGER,
      params: DataTypes.TEXT,
      payment_method: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      paid_at: DataTypes.DATE,
      OrderId: DataTypes.INTEGER
    },
    {}
  );
  Payment.associate = function(models) {
    Payment.belongsTo(models.Order);
  };
  return Payment;
};
