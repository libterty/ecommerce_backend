const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const imgur = require('imgur-node-api');
const db = require('../models');
const User = db.User;
const helpers = require('../_helpers');
const Cache = require('../util/cache');
const IMGUR_CLIENT_ID = process.env.imgur_id;
const cache = new Cache();

const userController = {
  /**
   * @swagger
   * /api/signUp:
   *    get:
   *      description: Register user
   *      parameters:
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: email
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: password
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: passwordCheck
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   */
  signUp: (req, res) => {
    const { passwordCheck, password, email, name } = req.body;
    if (!name || !password || !passwordCheck || !email) {
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
        where: { email }
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

  /**
   * @swagger
   * /api/signin:
   *    get:
   *      description: Signin user
   *      parameters:
   *      - name: email
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: password
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: error
   */
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
      where: { email: username }
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

  /**
   * @swagger
   * /api/users/:id:
   *    get:
   *      description: Find User by ID
   *      operationId: getUserId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: UserId
   *        in: path
   *        description: ID of user to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  getUserInfo: async (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }
    const result = await cache.get(
      `getUserInfo${req.connection.remoteAddress}:${req.params.id}`
    );
    if (result !== null) {
      return User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      }).then(async user => {
        if (user) {
          await cache.set(
            `getUserInfo${req.connection.remoteAddress}:${req.params.id}`,
            { status: 'success', user }
          );
          const newResult = await cache.get(
            `getUserInfo${req.connection.remoteAddress}:${req.params.id}`
          );
          return res.status(200).json(JSON.parse(newResult));
        }
        return res
          .status(400)
          .json({ status: 'error', message: 'Can not find any user data' });
      });
    } else {
      return User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      }).then(async user => {
        if (user) {
          await cache.set(
            `getUserInfo${req.connection.remoteAddress}:${req.params.id}`,
            { status: 'success', user }
          );
          return res.status(200).json({ status: 'success', user });
        }
        return res
          .status(400)
          .json({ status: 'error', message: 'Can not find any user data' });
      });
    }
  },

  /**
   * @swagger
   * /api/users/{UserId}:
   *    put:
   *      description: Find User by ID
   *      operationId: getUserId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: UserId
   *        in: path
   *        description: ID of user to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: email
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: password
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: birthday
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: address
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: tel
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: url
   *        schema:
   *          type: string
   *        in: file
   *        required: true
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
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

    const isEmail = await User.findOne({ where: { email } }).then(user => {
      return user;
    });

    if (isEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already in use'
      });
    }

    return User.findByPk(req.params.id).then(user => {
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
  },

  /**
   * @swagger
   * /api/get_current_user:
   *    get:
   *      description: get current user by sesson
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: user
   *        in: session
   *        description: Session of user to return
   *        required: true
   *        schema:
   *          type: Object
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         401:
   *           description: Unauthorized
   */
  getCurrentUser: async (req, res) => {
    const result = await cache.get(
      `getCurrentUser${req.connection.remoteAddress}:${
        helpers.getUser(req).name
      }`
    );
    if (result !== null) {
      const data = {
        status: 'success',
        id: helpers.getUser(req).id,
        name: helpers.getUser(req).name,
        email: helpers.getUser(req).email,
        address: helpers.getUser(req).address
          ? helpers.getUser(req).address
          : '',
        tel: helpers.getUser(req).tel ? helpers.getUser(req).tel : '',
        isAdmin: helpers.getUser(req).admin
      };
      await cache.set(
        `getCurrentUser${req.connection.remoteAddress}:${
          helpers.getUser(req).name
        }`,
        data
      );
      const newResult = await cache.get(
        `getCurrentUser${req.connection.remoteAddress}:${
          helpers.getUser(req).name
        }`
      );
      return res.status(200).json(JSON.parse(newResult));
    } else {
      const data = {
        status: 'success',
        id: helpers.getUser(req).id,
        name: helpers.getUser(req).name,
        email: helpers.getUser(req).email,
        address: helpers.getUser(req).address
          ? helpers.getUser(req).address
          : '',
        tel: helpers.getUser(req).tel ? helpers.getUser(req).tel : '',
        isAdmin: helpers.getUser(req).admin
      };
      await cache.set(
        `getCurrentUser${req.connection.remoteAddress}:${
          helpers.getUser(req).name
        }`,
        data
      );
      return res.status(200).json(data);
    }
  }
};

module.exports = userController;
