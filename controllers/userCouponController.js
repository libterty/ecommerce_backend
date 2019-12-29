const db = require('../models');
const Coupon = db.Coupon;
const User = db.User;
const CouponItem = db.CouponItem;

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
  }
};

module.exports = userCouponController;
