const Sequelize = require('sequelize');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Category = db.Category;
const Op = Sequelize.Op;

const productController = {
  getHomePageProducts: (req, res) => {
    return Product.findAll().then(async products => {
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
      // console.log('products log', products);
      return res.status(200).json({ status: 'success', products });
    });
  },

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

  getProduct: (req, res) => {
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
        product.increment('viewCounts').then(product => {
          return res
            .status(200)
            .json({ status: 'success', product, Images, Colors });
        });
      } else {
        return res
          .status(400)
          .json({ status: 'error', message: 'Fail to find product' });
      }
    });
  },

  searchProducts: (req, res) => {
    const search = req.query.items;

    if (!search) {
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    }

    return Product.findAll({
      include: [Category, Image],
      limit: 10,
      where: {
        name: {
          [Op.substring]: search
        }
      }
    }).then(products => {
      if (products.length > 0) {
        products = products.sort((a, b) => b.viewCounts - a.viewCounts);
        return res.status(200).json({ status: 'success', products });
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Cannot find products' });
    });
  }
};

module.exports = productController;
