const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const userController = {
  signUp: (req, res) => {
    const { passwordCheck, password, email, name } = req.body;
    if (
      !password ||
      !passwordCheck ||
      !email ||
      password.length === 0 ||
      passwordCheck.length === 0
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    } else if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password length must greater or equal than 6'
      });
    } else if (password !== passwordCheck) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords are not the same'
      });
    } else {
      User.findOne({
        where: { email },
        lock: Sequelize.Transaction.LOCK.SHARE
      }).then(user => {
        if (user) {
          return res.status(400).json({
            status: 'error',
            message: 'This Email is already registered'
          });
        } else {
          User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return res.json({
              status: 'success',
              message: 'Register successfully!'
            });
          });
        }
      });
    }
  },
  signIn: (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'error',
        message: "required fields didn't exist"
      });
    }
    let username = req.body.email;
    let password = req.body.password;

    User.findOne({
      where: { email: username },
      lock: Sequelize.Transaction.LOCK.SHARE
    }).then(user => {
      if (!user)
        return res.status(401).json({
          status: 'error',
          message: 'no such user found or passwords did not match'
        });
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
          status: 'error',
          message: 'no such user found or passwords did not match'
        });
      }
      let payload = {
        id: user.id,
        name: user.name,
        isAdmin: user.admin,
        iat: Date.now()
      };
      let token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        { algorithm: 'RS256' }
      );

      return res.status(200).json({
        status: 'success',
        message: 'ok',
        token,
        user: {
          id: user.id,
          name: user.name,
          isAdmin: user.admin
        }
      });
    });
  }
};

module.exports = userController;
