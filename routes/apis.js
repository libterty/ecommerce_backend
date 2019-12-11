const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

router.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

router.get('/furnitures', productController.getHomePageProducts);

module.exports = router;
