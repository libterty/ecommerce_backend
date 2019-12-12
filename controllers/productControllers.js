const Sequelize = require('sequelize');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Op = Sequelize.Op;

const productController = {
  getHomePageProducts: (req, res) => {
    return Product.findAll().then(async products => {
      const Images = await Image.findAll().then(images => images);
      console.log('products log', Images);
      if (products) {
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
        console.log('products log', products);
        return res.status(200).json({ status: 'success', products });
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'fail to find products' });
    });
  }
};

module.exports = productController;
