'use strict';
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    'Coupon',
    {
      coupon_code: { type: DataTypes.STRING, allowNull: false },
      limited_usage: DataTypes.INTEGER,
      expire_date: DataTypes.DATE,
      percent: DataTypes.INTEGER
    },
    {}
  );
  Coupon.associate = function(models) {
    Coupon.belongsToMany(models.User, {
      through: {
        model: models.CouponItem,
        unique: false
      },
      foreignKey: 'CouponId',
      as: 'couponsForUsers'
    });
  };
  return Coupon;
};
