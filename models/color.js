'use strict';
module.exports = (sequelize, DataTypes) => {
  const Color = sequelize.define(
    'Color',
    {
      name: DataTypes.STRING
    },
    {}
  );
  Color.associate = function(models) {
    Color.hasMany(models.OrderItem);
    Color.hasMany(models.CartItem);
    Color.belongsToMany(models.Product, {
      through: {
        model: models.Inventory,
        unique: false
      },
      foreignKey: 'ColorId',
      as: 'sameColorInventories'
    });
  };
  return Color;
};
