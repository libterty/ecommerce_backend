const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helpers = require('./_helpers');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;
const logger = morgan('combined');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const options = {
  swaggerDefinition: {
    info: {
      title: 'ec_web_demo API',
      version: '1.0.0',
      description: 'Generate ec_web_demo API document with swagger'
    }
  },
  apis: ['./controllers/*.js']
};
const specs = swaggerJsdoc(options);

app.use(cors({ credentials: true, origin: true }));
app.use('/upload', express.static(__dirname + '/upload'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.user = helpers.getUser(req);
  next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(logger);

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}!`)
);

require('./routes')(app);

module.exports = app;
