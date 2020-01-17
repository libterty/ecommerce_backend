const mongoose = require('mongoose');
const Logs = require('../nosql/models/log');
const helpers = require('../_helpers');

const storeLogs = async (req, res, next) => {
  try {
    await res.on('finish', async function() {
      await new Logs({
        IP: req.connection.remoteAddress,
        host: req.hostname,
        originalUrl: req.originalUrl,
        protocol: req.protocol,
        method: req.method,
        body: req.body,
        status: res.statusCode,
        user_agent: helpers.getUser(req) ? helpers.getUser(req).name : ''
      }).save();
    });
    next();
  } catch (error) {
    console.log('error', error.message);
    next();
  }
};

module.exports = storeLogs;
