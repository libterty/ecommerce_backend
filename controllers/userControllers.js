const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const imgur = require('imgur-node-api');
const db = require('../models');
const User = db.User;
const helpers = require('../_helpers');
const IMGUR_CLIENT_ID = process.env.imgur_id;

const userController = {
  signUp: (req, res) => {
    const { passwordCheck, password, email, name } = req.body;
    if (!password || !passwordCheck || !email) {
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
  },
  getUserInfo: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }
    return User.findByPk(req.params.id).then(user => {
      if (user) {
        return res.status(200).json({ status: 'success', user });
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Can not find any user data' });
    });
  },
  putUserInfo: async (req, res) => {
    const { name, email, password, birthday, address, tel } = req.body;
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password length must greater or equal than 6'
      });
    }

    const isEmail = await User.findOne({ where: { email } }).then(user => { return user });
    
    if (isEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already in use'
      });
    }

    return User.findByPk(req.params.id, {
      lock: Sequelize.Transaction.LOCK.SHARE
    }).then(user => {
      const { file } = req;
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, (err, img) => {
          if (!img.data)
            return res
              .status(400)
              .json({ status: 'error', message: 'Image Upload Fail' });
          return user
            .update({
              name: name ? name : user.dataValues.name,
              email: email ? email : user.dataValues.email,
              password: password
                ? bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
                : user.dataValues.password,
              birthday: birthday ? birthday : user.dataValues.birthday,
              avatar: file ? img.data.link : user.dataValues.avatar,
              address: address ? address : user.dataValues.address,
              tel: tel ? tel : user.dataValues.tel
            })
            .then(() => {
              return res
                .status(200)
                .json({ status: 'success', message: 'update info success 1' });
            });
        });
      } else {
        return user
          .update({
            name: name ? name : user.dataValues.name,
            email: email ? email : user.dataValues.email,
            password: password
              ? bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
              : user.dataValues.password,
            birthday: birthday ? birthday : user.dataValues.birthday,
            address: address ? address : user.dataValues.address,
            tel: tel ? tel : user.dataValues.tel
          })
          .then(() => {
            return res
              .status(200)
              .json({ status: 'success', message: 'update info success 2' });
          });
      }
    });
  }
};

module.exports = userController;
