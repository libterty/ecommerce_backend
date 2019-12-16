const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const db = require('../models');
const User = db.User;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    // authenticate user
    (req, username, password, cb) => {
      User.findOne({ where: { email: username } }).then(user => {
        if (!user)
          return cb(
            null,
            false,
            req.flash('error_messages', '帳號或密碼輸入錯誤')
          );
        if (!bcrypt.compareSync(password, user.password))
          return cb(
            null,
            false,
            req.flash('error_messages', '帳號或密碼輸入錯誤！')
          );
        return cb(null, user);
      });
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    return cb(null, user);
  });
});

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.JWT_SECRET;

let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  User.findByPk(jwt_payload.id).then(user => {
    console.log('check log', user);
    if (!user) return next(null, false);
    return next(null, user.dataValues);
  });
});
passport.use(strategy);

module.exports = passport;
