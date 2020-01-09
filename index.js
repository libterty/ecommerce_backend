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
const redis = require('redis');

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

const REDIS_URL = process.env.NODE_ENV !== 'development' ? 'redis://h:pa97ed018fb96518fcced9c4959db34c64777eab9d17583c4af2baf1c00e2aa3b@ec2-52-7-9-220.compute-1.amazonaws.com:25929' : 'redis://127.0.0.1:6379';
let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient(REDIS_URL);

app.use(cors({ credentials: true, origin: true }));
app.use('/upload', express.static(__dirname + '/upload'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'trueAndFalse',
    name: 'trueAndFalse',
    cookie: {
      secure: false
    },
    resave: false,
    saveUninitialized: false
  })
);
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

app.listen(port, () => {
  console.log(`Example Redis Port Listening on port: ${REDIS_URL}`)
  console.log(`Example app listening on port http://localhost:${port}!`)
});

require('./routes')(app);

module.exports = app;
