const Sequelize = require('sequelize');
const imgur = require('imgur-node-api');
const db = require('../models');
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
const Op = Sequelize.Op;
const email = require('../util/email');
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

  postNewColorForProduct: (req, res) => {
    const { ProductId, name, quantity } = req.body;
    if (!name || !ProductId)
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

  putColorForProduct: async (req, res) => {
    const { ColorId, name } = req.body;
    const ProductId = req.params.id;
    let temp;
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
  },

  getOrders: (req, res) => {
    return Order.findAll().then(async orders => {
      try {
        let orderItems = await OrderItem.findAll({
          include: [Product, Color]
        }).then(items => items);
        orderItems = orderItems.map(orderItem => ({ ...orderItem.dataValues }));
        orders = orders.map(order => ({
          ...order.dataValues,
          orderItems: orderItems.filter(
            item => item.OrderId === order.dataValues.id
          )
        }));
        return res.status(200).json({ status: 'success', orders });
      } catch (error) {
        return res
          .status(500)
          .json({ status: 'error', message: 'Something went wrong' });
      }
    });
  },

  testOrders: async (req, res) => {
    try {
      const buyerEmail = process.env.testEmail;
      const emailSubject = `[Test 對與不對系統測試]：您的測試訂單已成功付款！`;
      const emailContent = `<h4>測試使用者 你好</h4>
                <p>您的訂單已成功付款，本次訂單金額為 ????? 元，若有任何問題，歡迎隨時與我們聯繫，感謝！</p>`;
      await email.sendEmail(buyerEmail, emailSubject, emailContent);
      return res
        .status(200)
        .json({ status: 'success', message: 'Send Email Success' });
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .json({ status: 'error', message: 'Something went wrong' });
    }
  },

  getShippings: (req, res) => {
    return Shipping.findAll().then(shippings => {
      if (shippings.length > 0) {
        shippings = shippings.map(item => ({ ...item.dataValues }));
        return res.status(200).json({ status: 'success', shippings });
      }
      return res.status(404).json({ status: 'error', message: 'Cannot find shippings' });
    })
  },

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
                  <p>您的訂單 #${shipping.OrderId} 已更新物流狀態到 ${shipping.shipping_status}，若有任何問題，歡迎隨時與我們聯繫，感謝！</p>`;
        await shipping.update({
          shipping_status: shippingStatus,
          updatedAt: new Date()
        });
        await email.sendEmail(buyerEmail, emailSubject, emailContent);

        return res.status(200).json({ status: 'success', message: 'Update shipping status success' });
      } catch (error) {
        console.log(error.message);
        return res
          .status(500)
          .json({ status: 'error', message: 'Something went wrong' });
      }
    })
  }
};

module.exports = adminController;
