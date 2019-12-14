const Sequelize = require('sequelize');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
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

  getProduct: (req, res) => {
    return Product.findByPk(req.params.id).then(async product => {
      if (product) {
        let Images = await Image.findAll({
          where: { ProductId: req.params.id }
        }).then(images => images);
        let Colors = await Color.findAll({
          where: { ProductId: req.params.id }
        }).then(colors => colors);
        Images = Images.map(image => ({ ...image.dataValues }));
        Colors = Colors.map(color => ({ ...color.dataValues }));
        return res
          .status(200)
          .json({ status: 'success', product, Images, Colors });
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Fail to find product' });
    });
  }
};

module.exports = productController;
