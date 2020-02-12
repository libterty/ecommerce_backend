const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helpers = require('./_helpers');
const morgan = require('morgan');
const redis = require('redis');
const nosqlConnect = require('./nosql/index');
const storeLogs = require('./middlewares/index');

const app = express();
const port = process.env.PORT || 80;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

nosqlConnect();
const logger = morgan('combined');

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

const REDIS_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REDIS_URL
    : 'redis://127.0.0.1:6379';
let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient(REDIS_URL);
let sessionOption = {
  store: new RedisStore({ client: redisClient }),
  secret: 'trueAndFalse',
  name: 'trueAndFalse',
  cookie: {
    secure: false
  },
  resave: false,
  saveUninitialized: true,
  sameSite: 'none'
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionOption.cookie.secure = true;
}

app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
);
app.use('/upload', express.static(__dirname + '/upload'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(cookieParser());
app.use(session(sessionOption));
app.use(function(req, res, next) {
  if (!req.session) return next(new Error('lost Connections'));
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.user = helpers.getUser(req);
  next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(logger);
app.use(storeLogs);

app.listen(port, () => {
  console.log(`Example Redis Port Listening on port: ${REDIS_URL}`);
  console.log(`Example app listening on port http://localhost:${port}!`);
});

require('./routes')(app);

module.exports = app;
