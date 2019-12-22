'use strict';
module.exports = (sequelize, DataTypes) => {
  const CouponItem = sequelize.define(
    'CouponItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      CouponId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER
    },
    {}
  );
  CouponItem.associate = function(models) {};
  return CouponItem;
};
