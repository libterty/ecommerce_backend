const Sequelize = require('sequelize');
const db = require('../models');
const helpers = require('../_helpers');
const Cart = db.Cart;
const Product = db.Product;
const CartItem = db.CartItem;
const User = db.User;
const Inventory = db.Inventory;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Shipping = db.Shipping;
const Op = Sequelize.Op;

const orderController = {
  createOrder: async (req, res) => {
    const { CartId, UserId } = req.body;

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
        address: UserInfo.address ? UserInfo.address : '',
        email: UserInfo.email,
        phone: UserInfo.tel ? UserInfo.tel : '',
        UserId: UserInfo.id
      }).then(order => {
        for (let i = 0; i < tempCartItems.length; i++) {
          Inventory.findOne({
            where: {
              ProductId: tempCartItems[i].ProductId,
              ColorId: tempCartItems[i].ColorId
            }
          }).then(async inventory => {
            if (inventory.quantity > tempCartItems[i].quantity) {
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

  getOrder: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    return Order.findOne({
      include: [{ model: Product, as: 'items' }],
      where: {
        UserId: req.params.UserId,
        payment_status: '未付款'
      }
    }).then(order => {
      if (order) {
        return res.status(200).json({ status: 'success', order });
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Nothing in your order list' });
    });
  },

  putOrder: (req, res) => {
    const {
      name,
      address,
      email,
      phone,
      shippingMethod,
      shippingStatus,
      shippingFee
    } = req.body;

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

    return Order.findByPk(req.params.OrderId).then(async order => {
      if (order) {
        try {
          if (order.total_amount > 3000) {
            await order.update({
              total_amount: order.total_amount,
              name: name ? name : order.name,
              address: address ? address : order.address,
              email: email ? email : order.email,
              phone: phone ? phone : order.phone,
              updatedAt: new Date()
            });
          } else {
            await order.update({
              total_amount: order.total_amount + shippingFee,
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
  }
};

module.exports = orderController;
