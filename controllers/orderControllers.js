const Sequelize = require('sequelize');
const db = require('../models');
const helpers = require('../_helpers');
const Cache = require('../util/cache');
const Cart = db.Cart;
const Product = db.Product;
const CartItem = db.CartItem;
const User = db.User;
const Inventory = db.Inventory;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Shipping = db.Shipping;
const Image = db.Image;
const Color = db.Color;
const Coupon = db.Coupon;
const Op = Sequelize.Op;
const cache = new Cache();

const orderController = {
  /**
   * @swagger
   * /api/orders/create:
   *    post:
   *      description: Create Orders for Existing Product
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: CartId
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: UserId
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
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
  createOrder: async (req, res) => {
    const { CartId, UserId, address, tel } = req.body;

    if (helpers.getUser(req).id !== Number(UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    if (!CartId || !UserId) {
      return res
        .status(400)
        .json({ status: 'error', message: "required field didn't exist" });
    }

    const order = await Order.findAll({
      where: { UserId, payment_status: '未付款' }
    });

    if (order.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please submit your order first before creating new one'
      });
    }

    return Cart.findByPk(CartId, {
      include: CartItem
    }).then(async cart => {
      const UserInfo = await User.findByPk(UserId).then(user => user);
      const tempCartItems = cart.CartItems;
      let id;
      let temp = {};
      return Order.create({
        order_status: '訂單處理中',
        shipping_status: '未出貨',
        payment_status: '未付款',
        name: UserInfo.name,
        address: UserInfo.address ? UserInfo.address : req.body.address,
        email: UserInfo.email,
        phone: UserInfo.tel ? UserInfo.tel : req.body.tel,
        UserId: UserInfo.id
      }).then(order => {
        for (let i = 0; i < tempCartItems.length; i++) {
          Inventory.findOne({
            where: {
              ProductId: tempCartItems[i].ProductId,
              ColorId: tempCartItems[i].ColorId
            }
          }).then(async inventory => {
            if (inventory.quantity >= tempCartItems[i].quantity) {
              await OrderItem.create({
                price: tempCartItems[i].price,
                quantity: tempCartItems[i].quantity,
                OrderId: order.id,
                ProductId: tempCartItems[i].ProductId,
                ColorId: tempCartItems[i].ColorId
              });
              await CartItem.destroy({
                where: {
                  CartId,
                  ProductId: tempCartItems[i].ProductId,
                  ColorId: tempCartItems[i].ColorId
                }
              });
              await order.update({
                total_amount: order.total_amount
                  ? order.total_amount +
                    tempCartItems[i].price * tempCartItems[i].quantity
                  : tempCartItems[i].price * tempCartItems[i].quantity
              });
              const newQuantity =
                inventory.quantity - tempCartItems[i].quantity;
              await inventory.update({
                quantity: newQuantity
              });
            } else {
              temp['nonCreate'] = true;
            }
          });
        }
        setTimeout(() => {
          if (temp.nonCreate || tempCartItems.length === 0) {
            Order.destroy({ where: { id: order.id } });
            return res
              .status(400)
              .json({ status: 'error', message: 'Create order fail' });
          }
          return res
            .status(200)
            .json({ status: 'success', message: 'Create order success' });
        }, 100);
      });
    });
  },
  /**
   * @swagger
   * /api/orders/{UserId}:
   *    get:
   *      description: Find Order by ID
   *      operationId: getOrderId
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
  getOrder: async (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    const result = await cache.get(
      `getOrder${req.connection.remoteAddress}:${req.params.UserId}`
    );

    if (result !== null) {
      return Order.findOne({
        include: [{ model: Product, include: [{ model: Image }], as: 'items' }],
        where: {
          UserId: req.params.UserId,
          payment_status: '未付款'
        }
      }).then(async order => {
        if (order) {
          const result = order.items.map(async item => ({
            ...item.dataValues,
            color: await Color.findByPk(item.dataValues.OrderItem.ColorId, {})
          }));

          const items = await Promise.all(result).then(complete => {
            return complete;
          });

          const data = {
            status: 'success',
            order: {
              id: order.id,
              sn: order.sn,
              order_status: order.order_status,
              shipping_status: order.shipping_status,
              payment_status: order.payment_status,
              total_amount: order.total_amount,
              name: order.name,
              address: order.address,
              email: order.email,
              phone: order.phone,
              invoice: order.invoice,
              UserId: order.UserId,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              items
            }
          };

          await cache.set(
            `getOrder${req.connection.remoteAddress}:${req.params.UserId}`,
            data
          );
          const newResult = await cache.get(
            `getOrder${req.connection.remoteAddress}:${req.params.UserId}`
          );
          return res.status(200).json(JSON.parse(newResult));
        }
        await cache.set(
          `getOrder${req.connection.remoteAddress}:${req.params.UserId}`,
          { status: 'error', message: 'Nothing in your order list' }
        );
        const newResult = await cache.get(
          `getOrder${req.connection.remoteAddress}:${req.params.UserId}`
        );
        return res.status(400).json(JSON.parse(newResult));
      });
    } else {
      return Order.findOne({
        include: [{ model: Product, include: [{ model: Image }], as: 'items' }],
        where: {
          UserId: req.params.UserId,
          payment_status: '未付款'
        }
      }).then(async order => {
        if (order) {
          const result = order.items.map(async item => ({
            ...item.dataValues,
            color: await Color.findByPk(item.dataValues.OrderItem.ColorId, {})
          }));

          const items = await Promise.all(result).then(complete => {
            return complete;
          });

          const data = {
            status: 'success',
            order: {
              id: order.id,
              sn: order.sn,
              order_status: order.order_status,
              shipping_status: order.shipping_status,
              payment_status: order.payment_status,
              total_amount: order.total_amount,
              name: order.name,
              address: order.address,
              email: order.email,
              phone: order.phone,
              invoice: order.invoice,
              UserId: order.UserId,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              items
            }
          };

          await cache.set(
            `getOrder${req.connection.remoteAddress}:${req.params.UserId}`,
            data
          );

          return res.status(200).json({
            status: 'success',
            queue: 'First Request',
            order: {
              id: order.id,
              sn: order.sn,
              order_status: order.order_status,
              shipping_status: order.shipping_status,
              payment_status: order.payment_status,
              total_amount: order.total_amount,
              name: order.name,
              address: order.address,
              email: order.email,
              phone: order.phone,
              invoice: order.invoice,
              UserId: order.UserId,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              items
            }
          });
        }
        await cache.set(
          `getOrder${req.connection.remoteAddress}:${req.params.UserId}`,
          { status: 'error', message: 'Nothing in your order list' }
        );
        return res.status(400).json({
          status: 'error',
          queue: 'First Request',
          message: 'Nothing in your order list'
        });
      });
    }
  },
  /**
   * @swagger
   * /api/orders/{OrderId}/users/{UserId}:
   *    put:
   *      description: Revise order by it's own user
   *      operationId: replaceOrderById
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: OrderId
   *        in: path
   *        description: ID of order to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
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
   *      - name: address
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: email
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: phone
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: shippingMethod
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: shippingStatus
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: shippingFee
   *        schema:
   *          type: string
   *        in: body
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
  putOrder: async (req, res) => {
    const {
      name,
      address,
      email,
      phone,
      shippingMethod,
      shippingStatus,
      shippingFee,
      couponId
    } = req.body;
    let coupon;

    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    if (!shippingMethod || !shippingStatus || !shippingFee) {
      return res
        .status(400)
        .json({ status: 'error', message: "required field didn't exist" });
    }

    if (shippingMethod !== '黑貓宅急便') {
      return res
        .status(400)
        .json({ status: 'error', message: "shippingMethod didn't exist" });
    }

    if (shippingStatus !== '未出貨') {
      return res
        .status(400)
        .json({ status: 'error', message: 'wrong shippingStatus' });
    }

    if (shippingFee !== 350) {
      return res
        .status(400)
        .json({ status: 'error', message: "shippingFee didn't exist" });
    }

    if (!address) {
      return res
        .status(400)
        .json({ status: 'error', message: "Contact address didn't exist" });
    }

    if (!phone) {
      return res
        .status(400)
        .json({ status: 'error', message: "Contact phone didn't exist" });
    }

    if (couponId) {
      coupon = await Coupon.findByPk(couponId, {});
    }

    return Order.findByPk(req.params.OrderId).then(async order => {
      if (order) {
        try {
          if (order.total_amount > 3000) {
            await order.update({
              total_amount: couponId
                ? Math.floor((order.total_amount * coupon.percent) / 100)
                : order.total_amount,
              name: name ? name : order.name,
              address: address ? address : order.address,
              email: email ? email : order.email,
              phone: phone ? phone : order.phone,
              updatedAt: new Date()
            });
          } else {
            await order.update({
              total_amount: couponId
                ? Math.floor(
                    ((order.total_amount + shippingFee) * coupon.percent) / 100
                  )
                : order.total_amount + shippingFee,
              name: name ? name : order.name,
              address: address ? address : order.address,
              email: email ? email : order.email,
              phone: phone ? phone : order.phone,
              updatedAt: new Date()
            });
          }
          await Shipping.create({
            shipping_method: shippingMethod,
            shipping_status: shippingStatus,
            shipping_fee: shippingFee,
            name: name ? name : order.name,
            address: address ? address : order.address,
            email: email ? email : order.email,
            phone: phone ? phone : order.phone,
            OrderId: order.id
          });
          return res
            .status(200)
            .json({ status: 'success', message: 'Update order success' });
        } catch (error) {
          return res
            .status(500)
            .json({ status: 'error', message: 'Something went wrong' });
        }
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Cannot find this Order' });
    });
  },
  /**
   * @swagger
   * /api/orders/{OrderId}/users/{UserId}:
   *    delete:
   *      description: Delete Existing Order
   *      operationId: deleteOrderById
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: OrderId
   *        in: path
   *        description: ID of order to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
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
  deleteOrder: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    return Order.findByPk(req.params.OrderId, {
      include: OrderItem
    }).then(async order => {
      if (order) {
        try {
          for (let i = 0; i < order.OrderItems.length; i++) {
            await Inventory.findOne({
              where: {
                ProductId: order.OrderItems[i].ProductId,
                ColorId: order.OrderItems[i].ColorId
              }
            }).then(inventory => {
              inventory.update({
                quantity: inventory.quantity + order.OrderItems[i].quantity
              });
            });
            await OrderItem.findByPk(order.OrderItems[i].id).then(orderItem => {
              orderItem.destroy();
            });
          }
          await order.destroy();

          return res
            .status(200)
            .json({ status: 'success', message: 'Delete order success' });
        } catch (error) {
          return res
            .status(500)
            .json({ status: 'error', message: 'Something went wrong' });
        }
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Cannot find this order' });
    });
  },
  /**
   * @swagger
   * /api/orders/users/{UserId}:
   *    get:
   *      description: Find all user's order by ID
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
  getOrders: async (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    const result = await cache.get(
      `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`
    );

    if (result !== null) {
      return Order.findAll({
        where: {
          UserId: req.params.UserId
        }
      }).then(async orders => {
        if (orders.length > 0) {
          await cache.set(
            `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`,
            { status: 'success', orders }
          );
          const newResult = await cache.get(
            `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`
          );
          return res.status(200).json(JSON.parse(newResult));
        }
        await cache.set(
          `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`,
          { status: 'error', message: "You don't have any orders record" }
        );
        const newResult = await cache.get(
          `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`
        );
        return res.status(400).json(JSON.parse(newResult));
      });
    } else {
      return Order.findAll({
        where: {
          UserId: req.params.UserId
        }
      }).then(async orders => {
        if (orders.length > 0) {
          await cache.set(
            `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`,
            { status: 'success', orders }
          );
          return res
            .status(200)
            .json({ status: 'success', queue: 'First Request', orders });
        }
        await cache.set(
          `getOrders${req.connection.remoteAddress}:User:${req.params.UserId}`,
          { status: 'error', message: "You don't have any orders record" }
        );
        return res.status(400).json({
          status: 'error',
          queue: 'First Request',
          message: "You don't have any orders record"
        });
      });
    }
  }
};

module.exports = orderController;
