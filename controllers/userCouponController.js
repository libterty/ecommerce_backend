const Sequelize = require('sequelize');
const db = require('../models');
const Coupon = db.Coupon;
const User = db.User;
const CouponItem = db.CouponItem;
const Op = Sequelize.Op;

const userCouponController = {
  /**
   * @swagger
   * /api/users/coupons:
   *    get:
   *      description: Find coupons belongs to user
   *      operationId: getUserId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: UserId
   *        in: session
   *        description: ID of user to return
   *        required: true
   *        schema:
   *          type: integer
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         400:
   *           description: error
   *         401:
   *           description: Unauthorized
   *         500:
   *           description: error
   */
  getCoupons: async (req, res) => {
    try {
      let userCoupons = await User.findByPk(req.user.id, {
        include: [{ model: Coupon, as: 'coupons' }]
      }).then(c => c);
      userCoupons = userCoupons.coupons.map(item => ({
        id: item.id,
        coupon_code: item.coupon_code,
        limited_usage: item.limited_usage,
        percent: item.percent,
        expire_date: item.expire_date
      }));
      if (userCoupons.length === 0)
        res
          .status(400)
          .json({ status: 'error', message: 'None of coupons be found' });
      return res.json({
        status: 'success',
        message: 'Got coupons successfully',
        userCoupons
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to get coupons' });
    }
  },

  /**
   * @swagger
   * /api/orders/coupons:
   *    get:
   *      description: Find all coupons withIn Range
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         401:
   *           description: Unauthorized
   *         404:
   *           description: error
   */
  getValidCoupons: (req, res) => {
    return Coupon.findAll({
      where: {
        limited_usage: {
          [Op.gt]: 0
        },
        expire_date: {
          [Op.gt]: new Date()
        }
      }
    }).then(coupons => {
      if (coupons.length > 0) {
        coupons = coupons.map(coupon => ({ ...coupon.dataValues }));
        return res.status(200).json({ status: 'success', coupons });
      }
      return res
        .status(404)
        .json({ status: 'error', message: 'No coupons available now' });
    });
  },

  /**
   * @swagger
   * /api/orders/coupons/{CouponId}:
   *    get:
   *      description: Find coupon by Id
   *      operationId: getCouponId
   *      parameters:
   *      - name: Authorization
   *        schema:
   *          type: string
   *        in: header
   *        required: true
   *      - name: CouponId
   *        in: path
   *        description: ID of coupon to return
   *        required: true
   *        schema:
   *          type: integer
   *          format: int64
   *      security:
   *        - Authorization: []
   *      responses:
   *         200:
   *           description: success
   *         401:
   *           description: Unauthorized
   */
  useValidCoupon: (req, res) => {
    return Coupon.findByPk(req.params.id).then(coupon => {
      const vCoupon = coupon.dataValues.coupon_code || '';
      if (vCoupon === 'SHIPPINGFREE') {
        return res
          .status(200)
          .json({ status: 'success', message: 'Use coupon success' });
      } else {
        coupon.decrement('limited_usage').then(() => {
          return res
            .status(200)
            .json({ status: 'success', message: 'Use coupon success' });
        });
      }
    });
  }
};

module.exports = userCouponController;
