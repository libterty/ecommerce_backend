const db = require('../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;

const cartController = {
  getCart: async (req, res) => {
    try {
      if (!req.session.cartId) {
        return res.json({
          status: 'error',
          message: 'No such a cart id data'
        });
      }
      return Cart.findByPk(req.session.cartId, { include: 'items' }).then(
        cart => {
          cart = cart || { items: [] };
          let totalPrice =
            cart.items.length > 0
              ? cart.items
                  .map(d => d.price * d.CartItem.quantity)
                  .reduce((a, b) => a + b)
              : 0;
          return res.json({
            status: 'success',
            message: 'Fetch cart data successfully',
            cart,
            totalPrice
          });
        }
      );
    } catch (error) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Fail to fetch cart data' });
    }
  },
  postCart: async (req, res) => {
    try {
      return Cart.findOrCreate({
        where: {
          id: req.session.cartId || 0
        }
      }).spread(function(cart, created) {
        const { price, quantity, productId, colorId } = req.body;
        if (!price) {
          return res.json({ status: 'error', message: 'price is missing' });
        }
        if (!quantity) {
          return res.json({ status: 'error', message: 'quantity is missing' });
        }
        if (!productId || !colorId) {
          return res.json({
            status: 'error',
            message: 'Fail to find products'
          });
        }
        // TODO: missing imageID?
        return CartItem.findOrCreate({
          where: {
            CartId: cart.id,
            ProductId: productId,
            price,
            quantity: quantity,
            ColorId: colorId
          },
          default: {
            CartId: cart.id,
            price,
            quantity,
            ProductId: productId,
            ColorId: colorId
          }
        }).spread(function(cartItem, created) {
          return cartItem
            .update({
              quantity: (cartItem.quantity || 0) + 1
            })
            .then(cartItem => {
              req.session.cartId = cart.id;
              return req.session.save(() => {
                return res.json({
                  status: 'success',
                  message: 'Added to cart'
                });
              });
            });
        });
      });
    } catch (error) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Fail to add to cart' });
    }
  }
};

module.exports = cartController;
