const Sequelize = require('sequelize');
const db = require('../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;

const cartController = {
  /**
   * @swagger
   * /api/cart:
   *    get:
   *      description: Find Cart by sesssion CartID
   *      operationId: getCartId
   *      parameters:
   *      - name: CartId
   *        in: cookie
   *        description: ID of cart to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      responses:
   *         200:
   *           description: success
   *         500:
   *           description: error
   */
  getCart: async (req, res) => {
    try {
      if (!req.session.cartId) {
        return res.status(400).json({
          status: 'error',
          message: 'No such a cart id data'
        });
      }
      const Products = await Product.findAll().then(products => products);
      let cartItems = await CartItem.findAll({
        where: { CartId: req.session.cartId }
      }).then(c => c);
      const Colors = await Color.findAll().then(colors => colors);
      const Images = await Image.findAll().then(images => images);
      const Inventories = await Inventory.findAll().then(
        inventories => inventories
      );

      cartItems = cartItems.map(cart => ({
        ...cart.dataValues,
        Product: Products.filter(i => i.dataValues).find(
          product => product.id == cart.dataValues.ProductId
        ),
        Color: Colors.filter(i => i.dataValues).find(
          color => color.id == cart.dataValues.ColorId
        ),
        Image: Images.filter(i => i.dataValues).find(
          image => image.ProductId == cart.dataValues.ProductId
        ),
        Inventories: Inventories.filter(i => i.dataValues).find(
          inventory =>
            inventory.ProductId == cart.dataValues.ProductId &&
            inventory.ColorId == cart.dataValues.ColorId
        )
      }));

      let totalPrice =
        cartItems.length > 0
          ? cartItems.map(d => d.price * d.quantity).reduce((a, b) => a + b)
          : 0;

      return res.status(200).json({
        status: 'success',
        message: 'Fetch cart data successfully',
        cart: cartItems,
        totalPrice
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to fetch cart data' });
    }
  },

  /**
   * @swagger
   * /api/cart:
   *    post:
   *      description: Create Cart and CartItem
   *      parameters:
   *      - name: CartId
   *        in: cookie
   *        description: ID of cart to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: quantity
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: productId
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: colorId
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   */
  postCart: async (req, res) => {
    const { price, quantity, productId, colorId } = req.body;
    if (!price) {
      return res
        .status(400)
        .json({ status: 'error', message: 'price is missing' });
    }
    if (!quantity) {
      return res
        .status(400)
        .json({ status: 'error', message: 'quantity is missing' });
    }
    if (!productId || !colorId) {
      return res.status(400).json({
        status: 'error',
        message: 'Fail to find products'
      });
    }
    try {
      const inventory = await Inventory.findOne({
        where: { ProductId: productId, ColorId: colorId }
      });

      if (quantity > inventory.quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Quantity cannot more then inventory'
        });
      }

      return Cart.findOrCreate({
        where: {
          id: req.session.cartId || 0
        }
      }).spread(function(cart, created) {
        return CartItem.findOrCreate({
          where: {
            CartId: cart.id,
            ProductId: productId,
            ColorId: colorId
          },
          default: {
            CartId: cart.id,
            price,
            quantity: 0,
            ProductId: productId,
            ColorId: colorId
          }
        }).spread(function(cartItem, created) {
          return cartItem
            .update({
              quantity: cartItem.quantity + quantity,
              price
            })
            .then(cartItem => {
              req.session.cartId = cart.id;
              return req.session.save(err => {
                if (err) {
                  return res.send('session error' + err);
                }
                return res.status(200).json({
                  status: 'success',
                  message: 'Added to cart'
                });
              });
            });
        });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to add to cart' });
    }
  },

  /**
   * @swagger
   * /api/cart/{CartId}/add:
   *    post:
   *      description: Add quantity for CartItem
   *      operationId: getCartId
   *      parameters:
   *      - name: CartId
   *        in: cookie
   *        description: ID of cart to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         500:
   *           description: error
   */
  addCartItem: async (req, res) => {
    try {
      const cart = await Cart.findByPk(req.session.cartId);
      if (!cart) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update item not in the cart'
        });
      }

      await CartItem.findByPk(req.params.id).then(async item => {
        const inventory = await Inventory.findOne({
          where: { ProductId: item.ProductId, ColorId: item.ColorId }
        });
        if (inventory.quantity > item.quantity) {
          await item.increment('quantity');

          return res.status(200).json({
            status: 'success',
            message: 'Update cart successfully'
          });
        } else {
          return res.status(400).json({
            status: 'error',
            message: 'Inventory is not enough'
          });
        }
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to add up cart item' });
    }
  },

  /**
   * @swagger
   * /api/cart/{CartId}/sub:
   *    post:
   *      description: Sub quantity for CartItem
   *      operationId: getCartId
   *      parameters:
   *      - name: CartId
   *        in: cookie
   *        description: ID of cart to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         500:
   *           description: error
   */
  subCartItem: async (req, res) => {
    try {
      const cart = await Cart.findByPk(req.session.cartId);
      if (!cart) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update item not in the cart'
        });
      }
      const cartItem = await CartItem.findByPk(req.params.id);
      if (cartItem.quantity > 1) {
        await cartItem.decrement('quantity');
        return res.status(200).json({
          status: 'success',
          message: 'Update cart successfully'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'CartItem quantity must more then zero'
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to subtract cart item' });
    }
  },

  /**
   * @swagger
   * /api/cart/{CartId}:
   *    delete:
   *      description: Delete CartItem
   *      operationId: getCartId
   *      parameters:
   *      - name: CartId
   *        in: cookie
   *        description: ID of cart to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   */
  deleteCartItem: async (req, res) => {
    try {
      const cart = await Cart.findByPk(req.session.cartId);
      if (!cart) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update item not in the cart'
        });
      }
      const cartItem = await CartItem.findByPk(req.params.id);
      await cartItem.destroy();
      return res.json({ status: 'success', message: 'Removed item from cart' });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Fail to remove the item from cart'
      });
    }
  }
};

module.exports = cartController;
