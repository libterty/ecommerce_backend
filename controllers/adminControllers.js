const Sequelize = require('sequelize');
const imgur = require('imgur-node-api');
const db = require('../models');
const Product = db.Product;
const Image = db.Image;
const Color = db.Color;
const Inventory = db.Inventory;
const Category = db.Category;
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
      return res.status(200).json({ status: 'success', products });
    });
  },

  getProduct: (req, res) => {
    return Product.findByPk(req.params.id, {
      include: [Category, Image, { model: Color, as: 'inventories' }]
    })
      .then(product => {
        product = product.dataValues;
        return res.status(200).json({ status: 'success', product });
      })
      .catch(() => {
        return res
          .status(200)
          .json({ status: 'error', message: 'Cannot find what you want' });
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

    return Product.findOne({ where: { name: name } }).then(pro => {
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

  postNewColorForProduct: (req, res) => {
    const { ProductId, name, quantity } = req.body;
    if (!name || !ProductId)
      return res
        .status(400)
        .json({ status: 'error', message: "required fields didn't exist" });
    return Color.findOne({ where: { name, ProductId } }).then(color => {
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

  putColorForProduct: (req, res) => {
    const { name } = req.body;
    return Color.findByPk(req.params.id).then(color => {
      if (name === color.name) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Color is already exist' });
      }
      color
        .update({
          name: name ? name : color.name,
          updatedAt: new Date()
        })
        .then(color => {
          return res
            .status(200)
            .json({ status: 'success', message: 'Update New Color' });
        });
    });
  },

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
  }
};

module.exports = adminController;
