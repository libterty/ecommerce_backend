'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatItem = sequelize.define(
    'ChatItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      question: { type: DataTypes.STRING, allowNull: false },
      answer: { type: DataTypes.STRING, allowNull: false },
      ChatId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {}
  );
  ChatItem.associate = function(models) {
    ChatItem.belongsTo(models.Chat);
  };
  return ChatItem;
};
