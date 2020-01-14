const mongoose = require('mongoose');
const databaseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI
    : 'mongodb://127.0.0.1/ec_web_log';

const nosqlConnect = () => {
  return mongoose
    .connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => console.log('DB connecting'))
    .catch(err => console.log(err.message));
};

module.exports = nosqlConnect;
