const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const passport = require('./config/passport');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'trueAndFalse',
    name: 'trueAndFalse',
    cookie: {
      secure: false
    },
    resave: false,
    saveUninitialized: false
  })
);
app.use(bodyParser.json());
// app.use(passport.initialize());
// app.use(passport.session());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}!`)
);

require('./routes')(app);

module.exports = app;
