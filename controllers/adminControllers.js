const Sequelize = require('sequelize');
const imgur = require('imgur-node-api');
const db = require('../models');
const email = require('../util/email');
const Cache = require('../util/cache');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Category = db.Category;
const Cart = db.Cart;
const CartItem = db.CartItem;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Shipping = db.Shipping;
const Payment = db.Payment;
const Op = Sequelize.Op;
const IMGUR_CLIENT_ID = process.env.imgur_id;
const cache = new Cache();

const adminController = {
  /**
   * @swagger
   * /api/admin:
   *    get:
   *      description: This should return message with 'Hello Admin!'
   *      parameters:
   *      - name: Authorization
   *        type: string
   *        in: header
   *        required: true
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         401:
   *           description: Unauthorized
   */
  hiAdmin: (req, res) => {
    res.status(200).json({ status: 'success', message: 'Hello Admin!' });
  },
  /**
   * @swagger
   * /api/admin/products:
   *    get:
   *      description: This should return all products
   *      parameters:
   *      - name: Authorization
   *        type: string
   *        in: header
   *        required: true
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         401:
   *           description: Unauthorized
   *
   */
  getProducts: async (req, res) => {
    const result = await cache.get('adminProducts');
    if (result !== null) {
      return Product.findAll({
        include: [{ model: Color, as: 'inventories' }]
      }).then(async products => {
        products = products.map(p => ({
          ...p.dataValues
        }));
        await cache.set('adminProducts', { status: 'success', products });
        const newResult = await cache.get('adminProducts');
        res.status(200).json(JSON.parse(newResult));
      });
    } else {
      return Product.findAll({
        include: [{ model: Color, as: 'inventories' }]
      }).then(async products => {
        products = products.map(p => ({
          ...p.dataValues
        }));
        await cache.set('adminProducts', { status: 'success', products });
        return res.status(200).json({ status: 'success', products });
      });
    }
  },
  /**
   * @swagger
   * /api/admin/products/{ProductId}:
   *    get:
   *      description: Find Product by ID
   *      operationId: getProductById
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  getProduct: async (req, res) => {
    const result = await cache.get(`adminProduct:${req.params.id}`);
    if (result !== null) {
      return Product.findByPk(req.params.id, {
        include: [Category, Image, { model: Color, as: 'inventories' }]
      }).then(async product => {
        product = product.dataValues;
        await cache.set(`adminProduct:${req.params.id}`, {
          status: 'success',
          product
        });
        const newResult = await cache.get(`adminProduct:${req.params.id}`);
        res.status(200).json(JSON.parse(newResult));
      });
    } else {
      return Product.findByPk(req.params.id, {
        include: [Category, Image, { model: Color, as: 'inventories' }]
      })
        .then(async product => {
          product = product.dataValues;
          await cache.set(`adminProduct:${req.params.id}`, {
            status: 'success',
            product
          });
          return res.status(200).json({ status: 'success', product });
        })
        .catch(() => {
          return res
            .status(400)
            .json({ status: 'error', message: 'Cannot find what you want' });
        });
    }
  },
  /**
   * @swagger
   * /api/admin/products:
   *    post:
   *      description: Create New Prodcuts
   *      operationId: placeProduct
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: description
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: cost
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: price
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: height
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: width
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: length
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: weight
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: material
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: CategoryId
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: quantity
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: colorName
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: url
   *        schema:
   *          type: string
   *        in: file
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  postProducts: (req, res) => {
    const {
      name,
      description,
      cost,
      price,
      height,
      width,
      length,
      weight,
      material,
      CategoryId,
      quantity,
      colorName
    } = req.body;

    if (
      !name ||
      !description ||
      !cost ||
      !price ||
      !height ||
      !width ||
      !length ||
      !weight ||
      !material ||
      !quantity ||
      !colorName
    ) {
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    }

    return Product.findOne({
      where: { name: name }
    }).then(async product => {
      if (product)
        return res
          .status(400)
          .json({ status: 'error', message: 'Product is already exist' });
      const dbProduct = await Product.create({
        name,
        description,
        cost,
        price,
        height,
        width,
        length,
        weight,
        material,
        CategoryId
      });
      if (dbProduct) {
        const dbColor = await Color.create({
          name: colorName,
          ProductId: dbProduct.dataValues.id
        });
        const dbInventory = await Inventory.create({
          quantity,
          ProductId: dbProduct.dataValues.id,
          ColorId: dbColor.dataValues.id
        });
        const { file } = req;
        if (file) {
          imgur.setClientID(IMGUR_CLIENT_ID);
          imgur.upload(file.path, (err, img) => {
            return Image.create({
              url: file ? img.data.link : null,
              ProductId: dbProduct.dataValues.id
            }).then(() => {
              return res
                .status(200)
                .json({ status: 'success', message: 'create success' });
            });
          });
        } else {
          return res.status(200).json({
            status: 'success',
            message: 'create without Product Image'
          });
        }
      } else {
        return res
          .status(500)
          .json({ status: 'error', message: 'something went wrong' });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/products/{ProductId}:
   *    put:
   *      description: Revise Existing Prodcuts
   *      operationId: replaceProduct
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: description
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: cost
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: price
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: height
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: width
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: length
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: weight
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      - name: material
   *        schema:
   *          type: string
   *        in: body
   *        required: false
   *      - name: CategoryId
   *        schema:
   *          type: integer
   *        in: body
   *        required: false
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  putProducts: (req, res) => {
    const {
      name,
      description,
      cost,
      price,
      height,
      width,
      length,
      weight,
      material,
      CategoryId
    } = req.body;

    return Product.findOne({
      where: { name: name }
    }).then(pro => {
      if (pro) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Product is already exist' });
      } else {
        Product.findByPk(req.params.id).then(product => {
          product
            .update({
              name: name ? name : product.name,
              description: description ? description : product.description,
              cost: cost ? cost : product.cost,
              price: price ? price : product.price,
              height: height ? height : product.height,
              width: width ? width : product.width,
              length: length ? length : product.length,
              weight: weight ? weight : product.weight,
              material: material ? material : product.material,
              CategoryId: CategoryId ? CategoryId : product.CategoryId,
              updatedAt: new Date()
            })
            .then(() => {
              return res
                .status(200)
                .json({ status: 'success', message: 'Update Prodcut Success' });
            });
        });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/products/colors:
   *    post:
   *      description: Create Color for Existing Product
   *      operationId: placeColorId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      - name: quantity
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  postNewColorForProduct: (req, res) => {
    const { ProductId, name, quantity } = req.body;
    if (!name || !ProductId || !quantity)
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    return Color.findOne({
      where: { name, ProductId }
    }).then(color => {
      if (color) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Color is already exist' });
      } else {
        Color.create({ name, ProductId }).then(color => {
          Inventory.create({
            quantity,
            ProductId,
            ColorId: color.dataValues.id
          }).then(() => {
            return res
              .status(200)
              .json({ status: 'success', message: 'Create New Color' });
          });
        });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/products/colors/{ProductId}:
   *    put:
   *      description: Revise Color for Existing Product
   *      operationId: replaceColorId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: name
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  putColorForProduct: async (req, res) => {
    const { ColorId, name } = req.body;
    const ProductId = req.params.id;
    let temp;
    if (!name)
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    try {
      await Inventory.findOne({
        where: { ProductId, ColorId }
      }).then(inventory => {
        temp = inventory.dataValues.quantity;
        inventory.destroy();
      });
      await Color.destroy({
        where: { id: ColorId }
      });
    } catch (error) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Something went wrong' });
    }
    return Color.findOne({
      where: { name, ProductId }
    }).then(color => {
      if (color) {
        Inventory.findOne({
          where: {
            ProductId,
            ColorId: color.dataValues.id
          }
        }).then(inventory => {
          const quantity = inventory.dataValues.quantity + temp;
          inventory
            .update({
              quantity
            })
            .then(item => {
              return res
                .status(200)
                .json({ status: 'success', message: 'Revise Color Success 1' });
            });
        });
      } else {
        Color.create({ name, ProductId }).then(color => {
          Inventory.create({
            quantity: temp,
            ProductId,
            ColorId: color.id
          }).then(() => {
            return res
              .status(200)
              .json({ status: 'success', message: 'Revise Color Success 2' });
          });
        });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/products/inventories/{InventoryId}:
   *    put:
   *      description: Revise Inventory for Existing Product
   *      operationId: replaceInventoryId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: InventoryId
   *        in: path
   *        description: ID of inventory to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: quantity
   *        schema:
   *          type: integer
   *        in: body
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  putInventoryForProduct: (req, res) => {
    const { quantity } = req.body;
    if (quantity < 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'required field is less than zero' });
    }

    return Inventory.findByPk(req.params.id).then(inventory => {
      inventory
        .update({
          quantity: quantity ? quantity : inventory.quantity,
          updatedAt: new Date()
        })
        .then(() => {
          return res
            .status(200)
            .json({ status: 'success', message: 'Update Inventory' });
        });
    });
  },
  /**
   * @swagger
   * /api/admin/products/images/{ProductId}:
   *    post:
   *      description: Create Image for Existing Product
   *      operationId: placeProductId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: url
   *        type: string
   *        in: file
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  posttImageForProduct: (req, res) => {
    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Image.create({
          url: file ? img.data.link : null,
          ProductId: req.params.id
        }).then(() => {
          return res
            .status(200)
            .json({ status: 'success', message: 'create success' });
        });
      });
    } else {
      return res
        .status(400)
        .json({ status: 'error', message: 'nothing to upload' });
    }
  },
  /**
   * @swagger
   * /api/admin/products/{ProductId}:
   *    delete:
   *      description: Delete Existing Product
   *      operationId: deleteProductById
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id).then(async product => {
      if (product) {
        await Color.destroy({
          where: { ProductId: product.dataValues.id }
        });
        await Image.destroy({
          where: { ProductId: product.dataValues.id }
        });
        await Inventory.destroy({
          where: { ProductId: product.dataValues.id }
        });
        product.destroy().then(() => {
          return res
            .status(200)
            .json({ status: 'success', message: 'delete success' });
        });
      } else {
        return res
          .status(400)
          .json({ status: 'error', message: 'nothing to delete' });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/orders:
   *    get:
   *      description: Find all Orders
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  getOrders: async (req, res) => {
    const result = await cache.get('adminOrders');
    if (result !== null) {
      return Order.findAll({
        where: {
          payment_status: '未付款'
        }
      }).then(async orders => {
        try {
          let orderItems = await OrderItem.findAll({
            include: [Product, Color]
          }).then(items => items);
          orderItems = orderItems.map(orderItem => ({
            ...orderItem.dataValues
          }));
          orders = orders.map(order => ({
            ...order.dataValues,
            orderItems: orderItems.filter(
              item => item.OrderId === order.dataValues.id
            )
          }));
          await cache.set('adminOrders', { status: 'success', orders });
          const newResult = await cache.get('adminOrders');
          res.status(200).json(JSON.parse(newResult));
        } catch (error) {
          return res
            .status(500)
            .json({ status: 'error', message: 'Something went wrong' });
        }
      });
    } else {
      return Order.findAll({
        where: {
          payment_status: '未付款'
        }
      }).then(async orders => {
        try {
          let orderItems = await OrderItem.findAll({
            include: [Product, Color]
          }).then(items => items);
          orderItems = orderItems.map(orderItem => ({
            ...orderItem.dataValues
          }));
          orders = orders.map(order => ({
            ...order.dataValues,
            orderItems: orderItems.filter(
              item => item.OrderId === order.dataValues.id
            )
          }));
          await cache.set('adminOrders', { status: 'success', orders });
          return res.status(200).json({ status: 'success', orders });
        } catch (error) {
          return res
            .status(500)
            .json({ status: 'error', message: 'Something went wrong' });
        }
      });
    }
  },
  /**
   * @swagger
   * /api/admin/orders/notify/:OrderId:
   *    get:
   *      description: Send Email Notification to users
   *      operationId: placeOrderId
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
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  notifyOrders: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.OrderId, {});

      const buyerEmail = order.email;
      const emailSubject = `[傢俱網 訂單狀態通知]：您的訂單尚未付款！`;
      const emailContent = `<h4>${order.name}使用者 你好</h4>
                <p>您的訂單目前尚未付款，請記得付款。
                若有任何問題，歡迎隨時與我們聯繫，感謝！</p>`;
      await email.sendEmail(buyerEmail, emailSubject, emailContent);
      return res
        .status(200)
        .json({ status: 'success', message: 'Send Email Success' });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Something went wrong' });
    }
  },
  /**
   * @swagger
   * /admin/shippings:
   *    get:
   *      description: Find all Shippings
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  getShippings: async (req, res) => {
    const result = await cache.get('adminShippings');
    if (result !== null) {
      return Shipping.findAll().then(async shippings => {
        if (shippings.length > 0) {
          shippings = shippings.map(item => ({ ...item.dataValues }));
          await cache.set('adminShippings', { status: 'success', shippings });
          const newResult = await cache.get('adminShippings');
          res.status(200).json(JSON.parse(newResult));
        } else {
          await cache.set('adminShippings', {
            status: 'error',
            message: 'Cannot find shippings'
          });
          const newResult = await cache.get('adminShippings');
          res.status(200).json(JSON.parse(newResult));
        }
      });
    } else {
      return Shipping.findAll().then(async shippings => {
        if (shippings.length > 0) {
          shippings = shippings.map(item => ({ ...item.dataValues }));
          await cache.set('adminShippings', { status: 'success', shippings });
          return res.status(200).json({ status: 'success', shippings });
        }
        await cache.set('adminShippings', {
          status: 'error',
          message: 'Cannot find shippings'
        });
        return res
          .status(404)
          .json({ status: 'error', message: 'Cannot find shippings' });
      });
    }
  },
  /**
   * @swagger
   * /api/admin/shippings/{ShippingId}:
   *    put:
   *      description: Revise Shipping for Existing Product
   *      operationId: replaceShippingId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: ShippingId
   *        in: path
   *        description: ID of shipping to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      - name: shippingStatus
   *        schema:
   *          type: string
   *        in: body
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  putShippings: (req, res) => {
    const { shippingStatus } = req.body;

    if (!shippingStatus) {
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    }
    if (shippingStatus !== '出貨中' && shippingStatus !== '已送達') {
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    }

    return Shipping.findByPk(req.params.id).then(async shipping => {
      try {
        const buyerEmail = shipping.email;
        const emailSubject = `[傢俱網 物流狀態通知]：您的訂單 #${shipping.OrderId} 已更新物流狀態！`;
        const emailContent = `<h4>${shipping.name} 使用者 你好</h4>
                  <p>您的訂單 #${shipping.OrderId} 已更新物流狀態，若有任何問題，歡迎隨時與我們聯繫，感謝！</p>`;
        await shipping.update({
          shipping_status: shippingStatus,
          updatedAt: new Date()
        });
        await email.sendEmail(buyerEmail, emailSubject, emailContent);

        return res.status(200).json({
          status: 'success',
          message: 'Update shipping status success'
        });
      } catch (error) {
        return res
          .status(500)
          .json({ status: 'error', message: 'Something went wrong' });
      }
    });
  },
  /**
   * @swagger
   * /api/admin/payments:
   *    get:
   *      description: Find all Payments
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   */
  getPayments: async (req, res) => {
    const result = await cache.get('adminPayments');
    if (result !== null) {
      return Order.findAll().then(async payments => {
        await cache.set('adminShippings', { status: 'success', payments });
        const newResult = await cache.get('adminPayments');
        res.status(200).json(JSON.parse(newResult));
      });
    } else {
      return Order.findAll().then(async payments => {
        await cache.set('adminShippings', { status: 'success', payments });
        return res.status(200).json({ status: 'success', payments });
      });
    }
  }
};

module.exports = adminController;
