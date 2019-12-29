const Sequelize = require('sequelize');
const db = require('../models');
const Coupon = db.Coupon;
const User = db.User;
const CouponItem = db.CouponItem;
const Op = Sequelize.Op;

const userCouponController = {
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
      return res.status(404).json({ status: 'error', message: 'No coupons available now' });
    });
  },

  useValidCoupon: (req, res) => {
    return Coupon.findByPk(req.params.id).then(coupon => {
      coupon.decrement('limited_usage').then(() => {
        return res.status(200).json({ status: 'success', message: 'Use coupon success' });
      })
    })
  }
};

module.exports = userCouponController;
