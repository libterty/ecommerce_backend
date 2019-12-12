'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.STRING,
      price: { type: DataTypes.FLOAT, allowNull: false },
      height: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
      length: DataTypes.INTEGER,
      weight: DataTypes.INTEGER,
      material: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      viewCounts: DataTypes.INTEGER,
      ratingCounts: DataTypes.INTEGER
    },
    {}
  );
  Product.associate = function(models) {
    Product.hasMany(models.Image);
    Product.belongsToMany(models.Order, {
      through: {
        model: models.OrderItem,
        unique: false
      },
      foreignKey: 'ProductId',
      as: 'orders'
    });
    Product.belongsToMany(models.Cart, {
      through: {
        model: models.CartItem,
        unique: false
      },
      foreignKey: 'ProductId',
      as: 'carts'
    });
    Product.belongsToMany(models.Color, {
      through: {
        model: models.Inventory,
        unique: false
      },
      foreignKey: 'ProductId',
      as: 'inventories'
    });
  };
  return Product;
};
