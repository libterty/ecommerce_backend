const db = require('../models');
const moment = require('moment');
const shortid = require('shortid');
const Coupon = db.Coupon;
const CouponItem = db.CouponItem;

const adminCouponController = {
  // admin coupon CRUD
  addCoupon: async (req, res) => {
    try {
      const { couponCode, limitedUsage, expireDate, percent } = req.body;
      if (!limitedUsage || !expireDate) {
        return res
          .status(400)
          .json({ status: 'error', message: 'All fields are required' });
      }
      const findCoupon = await Coupon.findOne({
        where: { coupon_code: couponCode }
      });
      if (findCoupon) {
        return res.json({
          status: 'error',
          message: 'Coupon code already existed'
        });
      }
      // if req.body.couponCode not exist, generate one
      if (!couponCode || couponCode.length === 0) {
        const generateCode = shortid.generate();

        return res.json({
          status: 'error',
          message: 'generate a coupon code',
          generateCode
        });
      } else {
        // check discount percentage is integer
        if (percent < 1 || !percent.typeof === 'number') {
          return res.status(400).json({
            status: 'error',
            message: 'Percentage of discount must greater than 1'
          });
        }
        // check coupon limited usage is integer
        if (limitedUsage < 1 || !limitedUsage.typeof === 'number') {
          return res.status(400).json({
            status: 'error',
            message: 'Number of coupon usage at least to be 1'
          });
        }
        // check expire date is over than now
        if (!moment(expireDate).isAfter(new Date())) {
          return res.status(400).json({
            status: 'error',
            message: 'Expire date must more than the time from now'
          });
        }

        const coupon = await Coupon.create({
          coupon_code: couponCode,
          limited_usage: limitedUsage,
          expire_date: new Date(expireDate),
          percent
        });
        if (!coupon) {
          return res
            .status(400)
            .json({ status: 'error', message: 'Create coupon failed' });
        }
        return res.json({
          status: 'success',
          message: 'Created coupon successfully'
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Not able to create coupon'
      });
    }
  },
  getCoupons: async (req, res) => {
    try {
      const coupons = await Coupon.findAll().then(d => d);
      return res.json({
        status: 'success',
        message: 'Got all coupons',
        coupons
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to get coupons' });
    }
  },
  // TODO: get specific coupon
  getCoupon: async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Can not fetch coupon info' });
      }
      return res.json({ status: 'success', coupon });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Fail to get coupon' });
    }
  },
  editCoupon: async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      const { couponCode, limitedUsage, expireDate, percent } = req.body;

      if (!coupon) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Coupon is not exist' });
      }

      if (!couponCode || !limitedUsage || !expireDate) {
        return res
          .status(400)
          .json({ status: 'error', message: 'All fields are required' });
      }

      // check discount percentage is integer
      if (percent < 1 || !percent.typeof === 'number') {
        return res.status(400).json({
          status: 'error',
          message: 'Percentage of discount must greater than 1'
        });
      }
      // check coupon limited usage is integer
      if (limitedUsage < 1 || !limitedUsage.typeof === 'number') {
        return res.status(400).json({
          status: 'error',
          message: 'Number of coupon usage at least to be 1'
        });
      }
      // check expire date is over than now
      if (!moment(expireDate).isAfter(new Date())) {
        return res.status(400).json({
          status: 'error',
          message: 'Expire date must more than the time from now'
        });
      }
      coupon.update({
        coupon_code: couponCode,
        limited_usage: limitedUsage,
        expire_date: expireDate,
        percent,
        updatedAt: new Date()
      });
      return res.json({
        status: 'success',
        message: 'Updated coupon data successfully'
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Not able to update coupon' });
    }
  },
  deleteCoupon: async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      await CouponItem.destroy({ where: { CouponId: coupon.dataValues.id } });
      await coupon.destroy();
      return res.json({
        status: 'success',
        message: 'Delete coupon successfully'
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Not able to delete coupon' });
    }
  }
};

module.exports = adminCouponController;