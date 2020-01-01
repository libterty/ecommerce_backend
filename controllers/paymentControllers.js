const Sequelize = require('sequelize');
const db = require('../models');
const helpers = require('../_helpers');
const Trade = require('../util/trading');
const email = require('../util/email');
const Order = db.Order;
const Shipping = db.Shipping;
const Payment = db.Payment;
const trade = new Trade();

const paymentController = {
  /**
   * @swagger
   * /payments/:OrderId/users/:UserId:
   *    get:
   *      description: Create Payments by OrderId and UserId
   *      parameters:
   *      - name: Bearer_Token
   *        type: string
   *        in: header
   *        required: true
   *      - name: OrderId
   *        type: integer
   *        in: path
   *        required: true
   *      - name: UserId
   *        type: integer
   *        in: path
   *        required: true
   *      security:
   *        - bearerAuth: []
   *      responses:
   *         200:
   *           description: success
   *         500:
   *           description: error
   *         401:
   *           description: error
   */
  createPayment: async (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.UserId)) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Can not find any user data' });
    }

    try {
      const order = await Order.findByPk(req.params.OrderId, {});
      const shipping = await Shipping.findOne({
        where: { OrderId: req.params.OrderId }
      });

      const buyerEmail = order.email;
      const emailSubject = `[傢俱網 物流狀態通知]：您的訂單 #${order.id} 已更新物流狀態！`;
      const emailContent = `<h4>${order.name} 使用者 你好</h4>
                  <p>您的訂單 #${order.id} 已建立付款流程，記得去付款喔。
                  若有任何問題，歡迎隨時與我們聯繫，感謝！</p>`;

      const tradeInfo = trade.getTradeInfo(
        order.total_amount,
        order.id,
        order.email
      );

      await order.update({
        sn: tradeInfo.MerchantOrderNo
      });

      await shipping.update({
        sn: tradeInfo.MerchantOrderNo
      });

      const paymentInfo = await Payment.create({
        sn: tradeInfo.MerchantOrderNo,
        params: null,
        total_amount: order.total_amount,
        payment_method: null,
        payment_status: '尚未付款',
        paid_at: new Date(),
        OrderId: order.id
      });

      await email.sendEmail(buyerEmail, emailSubject, emailContent);

      return res.status(200).json({
        status: 'success',
        message: 'Create payment success',
        tradeInfo,
        paymentInfo
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Something went wrong' });
    }
  },
  /**
   * @swagger
   * /spgateway/callback:
   *    post:
   *      description: Sending Data to Third Party
   *      parameters:
   *      - name: PayGateWay
   *        type: string
   *        in: path
   *        required: true
   *      - name: MerchantID
   *        type: string
   *        in: body
   *        required: true
   *      - name: TradeInfo
   *        type: string
   *        in: body
   *        required: true
   *      - name: TradeSha
   *        type: string
   *        in: body
   *        required: true
   *      - name: Version
   *        type: string
   *        in: body
   *        required: true
   *      responses:
   *         302:
   *           description: Third Party Response Data
   *         401:
   *           description: error
   */
  spgatewayCallback: async (req, res) => {
    const { TradeInfo } = req.body;

    try {
      // console.log('tradeInfo', TradeInfo);
      const data = JSON.parse(trade.createMpgAesDecrypt(TradeInfo));
      // console.log('data', data);

      const order = await Order.findOne({
        where: { sn: data.Result.MerchantOrderNo }
      });
      const shipping = await Shipping.findOne({
        where: { sn: data.Result.MerchantOrderNo }
      });
      const payment = await Payment.findOne({
        where: { sn: data.Result.MerchantOrderNo }
      });

      // Please redirect in Front-end either order is success or fail
      if (data.Status === 'SUCCESS') {
        await order.update({
          order_status: '訂單已結案',
          shipping_status: '出貨中',
          payment_status: '已付款',
          updatedAt: new Date()
        });
        await shipping.update({
          shipping_status: '出貨中',
          updatedAt: new Date()
        });
        await payment.update({
          params: JSON.stringify(data),
          payment_method: data.Result.PaymentType,
          payment_status: '已付款',
          updatedAt: new Date()
        });
        return res.redirect(`http://localhost:8080/users/${order.UserId}`);
      } else if (data.Status === 'MPG03009') {
        await payment.update({
          payment_status: '付款失敗'
        });
        return res.redirect(`http://localhost:8080/users/${order.UserId}`);
      }
    } catch (error) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Something went wrong' });
    }
  }
};

module.exports = paymentController;
