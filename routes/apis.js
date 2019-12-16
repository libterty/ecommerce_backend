const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartControllers');
const productController = require('../controllers/productControllers');
const userControlloer = require('../controllers/userControllers');

router.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

router.post('/signin', userControlloer.signIn);

// cart
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);

router.get('/furnitures', productController.getHomePageProducts);
router.get('/furnitures/:id', productController.getProduct);

module.exports = router;
