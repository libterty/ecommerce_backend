const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartControllers');
const productController = require('../controllers/productControllers');

router.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

// cart
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);

router.get('/furnitures', productController.getHomePageProducts);

module.exports = router;
