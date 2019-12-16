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

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'ecommerce%20backend%20server';

let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  User.findByPk(jwt_payload.id).then(user => {
    if (!user) return next(null, false);
    return next(null, user.dataValues);
  });
});
passport.use(strategy);

module.exports = passport;
