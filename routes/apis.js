const express = require('express');
const multer = require('multer');
const router = express.Router();

const cartController = require('../controllers/cartControllers');
const productController = require('../controllers/productControllers');
const userController = require('../controllers/userControllers');
const adminController = require('../controllers/adminControllers');
const adminCouponController = require('../controllers/adminCouponController');
const userCouponController = require('../controllers/userCouponController');
const orderController = require('../controllers/orderControllers');
const paymentController = require('../controllers/paymentControllers');
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
router.get(
  '/admin/orders',
  authenticated,
  authenticatedAdmin,
  adminController.getOrders
);
// test email function
router.get(
  '/admin/orders/test',
  authenticated,
  authenticatedAdmin,
  adminController.testOrders
);
router.get(
  '/admin/shippings',
  authenticated,
  authenticatedAdmin,
  adminController.getShippings
);
router.put(
  '/admin/shippings/:id',
  authenticated,
  authenticatedAdmin,
  adminController.putShippings
);


router.post('/signin', userController.signIn);
router.post('/signup', userController.signUp);

// cart
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.postCart);
router.post('/cart/:id/add', cartController.addCartItem);
router.post('/cart/:id/sub', cartController.subCartItem);
router.delete('/cart/:id', cartController.deleteCartItem);

router.post('/orders/create', authenticated, orderController.createOrder);
// orderController.getOrder params are default for UserId
router.get('/orders/:UserId', authenticated, orderController.getOrder);
// orderController.putOrders params are default for OrderId and UserId
router.put(
  '/orders/:OrderId/users/:UserId',
  authenticated,
  orderController.putOrder
);
// orderController.deleteOrder params are default for OrderId and UserId
router.delete(
  '/orders/:OrderId/users/:UserId',
  authenticated,
  orderController.deleteOrder
);

router.get(
  '/payments/:OrderId/users/:UserId',
  authenticated,
  paymentController.createPayment
);
router.post('/spgateway/callback', paymentController.spgatewayCallback)

router.get('/furnitures', productController.getHomePageProducts);
router.get('/furnitures/pagination', productController.getProducts);
router.get('/furnitures/search', productController.searchProducts);
router.get('/furnitures/:id', productController.getProduct);
// user coupons
router.get('/users/coupons/', authenticated, userCouponController.getCoupons);

router.get('/users/:id', authenticated, userController.getUserInfo);
router.put(
  '/users/:id',
  upload.single('avatar'),
  authenticated,
  userController.putUserInfo
);

// coupon
// admin coupon
router.post(
  '/admin/coupons/',
  authenticated,
  authenticatedAdmin,
  adminCouponController.addCoupon
);
router.get(
  '/admin/coupons/:id',
  authenticated,
  authenticatedAdmin,
  adminCouponController.getCoupon
);
router.put(
  '/admin/coupons/:id',
  authenticated,
  authenticatedAdmin,
  adminCouponController.editCoupon
);
router.delete(
  '/admin/coupons/:id',
  authenticated,
  authenticatedAdmin,
  adminCouponController.deleteCoupon
);
router.get(
  '/admin/coupons/',
  authenticated,
  authenticatedAdmin,
  adminCouponController.getCoupons
);

// TODO: send user coupon

module.exports = router;