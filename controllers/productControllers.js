const Sequelize = require('sequelize');
const db = require('../models');
const Cache = require('../util/cache');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Category = db.Category;
const Op = Sequelize.Op;
const cache = new Cache();

const productController = {
  /**
   * @swagger
   * /api/furnitures:
   *    get:
   *      description: Find All orders
   *      responses:
   *         200:
   *           description: success
   */
  getHomePageProducts: async (req, res) => {
    const result = await cache.get('getHomePageProducts');

    if (result) {
      return res.status(200).json(JSON.parse(result));
    } else {
      return Product.findAll({ limit: 6, order: [['id', 'DESC']] }).then(
        async products => {
          const Images = await Image.findAll().then(images => images);
          products = products.map(p => ({
            ...p.dataValues,
            Image: Images.filter(i => i.dataValues).find(
              item => item.ProductId == p.dataValues.id
            )
              ? Images.filter(i => i.dataValues).find(
                  item => item.ProductId == p.dataValues.id
                ).url
              : null
          }));
          await cache.set('getHomePageProducts', {
            status: 'success',
            products
          });
          return res
            .status(200)
            .json({ status: 'success', message: 'success1', products });
        }
      );
    }
  },

  /**
   * @swagger
   * /api/furnitures/pagination:
   *    get:
   *      description: Find All orders with Pagination
   *      parameters:
   *      - name: page
   *        schema:
   *          type: string
   *        in: query
   *        required: false
   *      - name: categoryId
   *        schema:
   *          type: string
   *        in: query
   *        required: false
   *      responses:
   *         200:
   *           description: success
   */
  getProducts: (req, res) => {
    const pageLimit = 10;
    let offset = 0;
    let whereQuery = {};
    let categoryId = '';
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery['CategoryId'] = categoryId;
    }

    Product.findAndCountAll({
      include: [Category, Image],
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      let page = Number(req.query.page) || 1;
      let pages = Math.ceil(result.count / pageLimit);
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      );
      let prev = page - 1 < 1 ? 1 : page - 1;
      let next = page + 1 > pages ? pages : page + 1;
      const data = result.rows.map(r => ({
        ...r.dataValues
      }));
      Category.findAll().then(categories => {
        return res.status(200).json({
          status: 'success',
          products: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        });
      });
    });
  },

  /**
   * @swagger
   * /api/furnitures/{ProductId}:
   *    get:
   *      description: Find product by Id
   *      operationId: getProductId
   *      parameters:
   *      - name: ProductId
   *        in: path
   *        description: ID of product to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      responses:
   *         200:
   *           description: success
   */
  getProduct: async (req, res) => {
    const result = await cache.get(
      `getProduct${req.connection.remoteAddress}:${req.params.id}`
    );
    if (result !== null) {
      return Product.findByPk(req.params.id).then(async product => {
        if (product) {
          let Images = await Image.findAll({
            where: { ProductId: req.params.id }
          }).then(images => images);
          let Colors = await Color.findAll({
            where: { ProductId: req.params.id }
          }).then(colors => colors);
          let Inventories = await Inventory.findAll({
            where: { ProductId: req.params.id }
          }).then(inventories => inventories);
          Images = Images.map(image => ({ ...image.dataValues }));
          Colors = Colors.map(color => ({
            ...color.dataValues,
            Inventory: Inventories.filter(i => i.dataValues).find(
              item => item.id == color.id
            )
          }));
          product.increment('viewCounts').then(async product => {
            await cache.set(
              `getProduct${req.connection.remoteAddress}:${req.params.id}`,
              { status: 'success', product, Images, Colors }
            );
            const newResult = await cache.get(
              `getProduct${req.connection.remoteAddress}:${req.params.id}`
            );
            return res.status(200).json(JSON.parse(newResult));
          });
        } else {
          await cache.set(
            `getProduct${req.connection.remoteAddress}:${req.params.id}`,
            { status: 'error', message: 'Fail to find product' }
          );
          const newResult = await cache.get(
            `getProduct${req.connection.remoteAddress}:${req.params.id}`
          );
          return res.status(400).json(JSON.parse(newResult));
        }
      });
    } else {
      return Product.findByPk(req.params.id).then(async product => {
        if (product) {
          let Images = await Image.findAll({
            where: { ProductId: req.params.id }
          }).then(images => images);
          let Colors = await Color.findAll({
            where: { ProductId: req.params.id }
          }).then(colors => colors);
          let Inventories = await Inventory.findAll({
            where: { ProductId: req.params.id }
          }).then(inventories => inventories);
          Images = Images.map(image => ({ ...image.dataValues }));
          Colors = Colors.map(color => ({
            ...color.dataValues,
            Inventory: Inventories.filter(i => i.dataValues).find(
              item => item.id == color.id
            )
          }));
          product.increment('viewCounts').then(async product => {
            await cache.set(
              `getProduct${req.connection.remoteAddress}:${req.params.id}`,
              { status: 'success', product, Images, Colors }
            );
            return res.status(200).json({
              status: 'success',
              queue: 'First Request',
              product,
              Images,
              Colors
            });
          });
        } else {
          await cache.set(
            `getProduct${req.connection.remoteAddress}:${req.params.id}`,
            { status: 'error', message: 'Fail to find product' }
          );
          return res
            .status(400)
            .json({ status: 'error', message: 'Fail to find product' });
        }
      });
    }
  },

  /**
   * @swagger
   * /api/furnitures/search:
   *    get:
   *      description: Find product by search
   *      parameters:
   *      - name: items
   *        schema:
   *          type: string
   *        in: query
   *        required: false
   *      responses:
   *         200:
   *           description: success
   */
  searchProducts: async (req, res) => {
    const search = decodeURI(req.query.items);
    const result = await cache.get(
      `searchProducts${req.connection.remoteAddress}:${search}`
    );
    if (result !== null) {
      return Product.findAll({
        include: [Category, Image],
        limit: 10,
        where: {
          name: {
            [Op.substring]: search
          }
        }
      }).then(async products => {
        if (products.length > 0) {
          products = products.sort((a, b) => b.viewCounts - a.viewCounts);
          await cache.set(
            `searchProducts${req.connection.remoteAddress}:${search}`,
            { status: 'success', products }
          );
          const newResult = await cache.get(
            `searchProducts${req.connection.remoteAddress}:${search}`
          );
          return res.status(200).json(JSON.parse(newResult));
        }
        await cache.set(
          `searchProducts${req.connection.remoteAddress}:${search}`,
          { status: 'error', message: 'Cannot find products' }
        );
        return res
          .status(400)
          .json({ status: 'error', message: 'Cannot find products' });
      });
    } else {
      return Product.findAll({
        include: [Category, Image],
        limit: 10,
        where: {
          name: {
            [Op.substring]: search
          }
        }
      }).then(async products => {
        if (products.length > 0) {
          products = products.sort((a, b) => b.viewCounts - a.viewCounts);
          await cache.set(
            `searchProducts${req.connection.remoteAddress}:${search}`,
            { status: 'success', products }
          );
          return res
            .status(200)
            .json({ status: 'success', queue: 'First Request', products });
        }
        await cache.set(
          `searchProducts${req.connection.remoteAddress}:${search}`,
          { status: 'error', message: 'Cannot find products' }
        );
        return res.status(400).json({
          status: 'error',
          queue: 'First Request',
          message: 'Cannot find products'
        });
      });
    }
  }
};

module.exports = productController;
