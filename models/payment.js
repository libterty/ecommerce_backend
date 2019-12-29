'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      sn: DataTypes.STRING,
      params: DataTypes.TEXT,
      total_amount: DataTypes.INTEGER,
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
