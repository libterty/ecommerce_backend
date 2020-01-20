'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    'Chat',
    {
      name: { type: DataTypes.STRING, allowNull: false }
    },
    {}
  );
  Chat.associate = function(models) {
    Chat.hasMany(models.ChatItem);
  };
  return Chat;
};
