'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {}, {});
  Cart.associate = function(models) {
    Cart.belongsToMany(models.Product, {
      through: {
        model: models.CartItem,
        unique: false
      },
      foreignKey: 'CartId',
      as: 'items'
    });
    Cart.hasMany(models.CartItem);
  };
  return Cart;
};
