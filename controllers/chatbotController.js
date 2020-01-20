const Sequelize = require('sequelize');
const db = require('../models');
const Cache = require('../util/cache');
const Chat = db.Chat;
const ChatItem = db.ChatItem;
const cache = new Cache();

const chatbotController = {
  /**
   * @swagger
   * /api/chatbot:
   *    get:
   *      description: Get All the chat
   *      responses:
   *         200:
   *           description: success
   *         500:
   *           description: error
   */

  getChatBot: async (req, res) => {
    const result = await cache.get('getChatBot');

    if (result) {
      return res.status(200).json(JSON.parse(result));
    } else {
      return Chat.findAll({
        include: ChatItem
      }).then(async chats => {
        await cache.set('getChatBot', {
          status: 'success',
          chats
        });

        return res.status(200).json({
          status: 'success',
          message: 'success1',
          chats
        });
      });
    }
  }
};

module.exports = chatbotController;
