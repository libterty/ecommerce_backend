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
router.get(
  '/admin/products/:id',
  authenticated,
  authenticatedAdmin,
  adminController.getProduct
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
router.put(
  '/admin/products/inventories/:id',
  authenticated,
  authenticatedAdmin,
  adminController.putInventoryForProduct
);
router.post(
  '/admin/products/images/:id',
  upload.single('url'),
  authenticated,
  authenticatedAdmin,
  adminController.posttImageForProduct
);
router.delete(
  '/admin/products/:id',
  authenticated,
  authenticatedAdmin,
  adminController.deleteProduct
);

router.post('/signin', userControlloer.signIn);
router.post('/signup', userControlloer.signUp);

// cart
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);
router.post('/cart/:id/add', cartController.addCartItem);
router.post('/cart/:id/sub', cartController.subCartItem);
router.delete('/cart/:id', cartController.deleteCartItem);

router.get('/furnitures', productController.getHomePageProducts);
router.get('/furnitures/pagination', productController.getProducts);
router.get('/furnitures/:id', productController.getProduct);

router.get('/users/:id', authenticated, userControlloer.getUserInfo);
router.put(
  '/users/:id',
  upload.single('avatar'),
  authenticated,
  userControlloer.putUserInfo
);

module.exports = router;
