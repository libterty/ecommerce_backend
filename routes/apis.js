const express = require('express');
const multer = require('multer');
const router = express.Router();

const cartController = require('../controllers/cartControllers');
const productController = require('../controllers/productControllers');
const userControlloer = require('../controllers/userControllers');
const adminController = require('../controllers/adminControllers');
const passport = require('../config/passport');
const helpers = require('../_helpers');
const authenticated = passport.authenticate('jwt', { session: false });
const upload = multer({ dest: 'temp/' });

const authenticatedAdmin = (req, res, next) => {
  if (helpers.getUser(req)) {
    if (helpers.getUser(req).admin) {
      return next();
    }
    return res
      .status(400)
      .json({ status: 'error', message: 'permission denied' });
  }
  return res
    .status(400)
    .json({ status: 'error', message: 'permission denied' });
};

router.get('/', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Hello World!' })
);

router.get('/test', authenticated, (req, res) =>
  res.status(200).json({ status: 'success', message: 'Auth Test!' })
);

router.get(
  '/admin',
  authenticated,
  authenticatedAdmin,
  adminController.hiAdmin
);

router.get(
  '/admin/products',
  authenticated,
  authenticatedAdmin,
  adminController.getProducts
);
router.post(
  '/admin/products',
  upload.single('url'),
  authenticated,
  authenticatedAdmin,
  adminController.postProducts
);
router.post(
  '/admin/products/colors',
  authenticated,
  authenticatedAdmin,
  adminController.postNewColorForProduct
);
router.put(
  '/admin/products/:id',
  authenticated,
  authenticatedAdmin,
  adminController.putProducts
);
router.put(
  '/admin/products/colors/:id',
  authenticated,
  authenticatedAdmin,
  adminController.putColorForProduct
);

router.post('/signin', userControlloer.signIn);

// cart
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);

router.get('/furnitures', productController.getHomePageProducts);
router.get('/furnitures/:id', productController.getProduct);

module.exports = router;
