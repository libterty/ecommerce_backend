const mongoose = require('mongoose');
const { Schema } = mongoose;

const ecWebLogSchema = new Schema({
  IP: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  body: {
    type: Object
  },
  status: {
    type: String,
    required: true
  },
  user_agent: {
    type: String
  }
});

module.exports = mongoose.model('ecWebLogModel', ecWebLogSchema);
