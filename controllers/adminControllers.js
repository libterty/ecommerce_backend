const Sequelize = require('sequelize');
const imgur = require('imgur-node-api');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Op = Sequelize.Op;
const IMGUR_CLIENT_ID = process.env.imgur_id;

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
  }
};

module.exports = adminController;
