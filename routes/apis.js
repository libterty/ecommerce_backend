const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');

router.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);
module.exports = router;
