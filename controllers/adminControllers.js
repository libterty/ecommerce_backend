const Sequelize = require('sequelize');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Op = Sequelize.Op;

const adminController = {
  hiAdmin: (req, res) => {
    res.status(200).json({ status: 'success', message: 'Hello Admin!' });
  },

  getProducts: (req, res) => {
    return Product.findAll({
      include: [{ model: Color, as: 'inventories' }]
    }).then(products => {
      products = products.map(p => ({
        ...p.dataValues
      }));
      // console.log('req log', products);
      return res.status(200).json({ status: 'success', products });
    });
  },

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
      quantity,
      ColorId,
      url
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
      !ColorId ||
      !url
    ) {
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    }

    return Product.findOne({ where: { name: name } }).then(async product => {
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
        material
      });
      if (dbProduct) {
        const dbInventory = await Inventory.create({
          quantity,
          ProductId: dbProduct.dataValues.id,
          ColorId
        });
        const dbImage = await Image.create({
          url,
          ProductId: dbProduct.dataValues.id
        });
        return res
          .status(200)
          .json({ status: 'success', message: 'create success' });
      }
      return res
        .status(500)
        .json({ status: 'error', message: 'something went wrong' });
    });
  }
};

module.exports = adminController;
