const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// const passport = require('./config/passport');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(cors({ credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(passport.initialize());
// app.use(passport.session());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}!`)
);

module.exports = app;
