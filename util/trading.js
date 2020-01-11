/* eslint-disable */
const crypto = require('crypto');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

class Trade {
  constructor() {
    this.URL = process.env.URL;
    this.MerchantID = process.env.MERCHANT_ID;
    this.HashKey = process.env.HASH_KEY;
    this.HashIV = process.env.HASH_IV;
    this.PayGateWay = 'https://ccore.spgateway.com/MPG/mpg_gateway';
    this.ReturnURL = this.URL + '/spgateway/callback?from=ReturnURL';
    this.NotifyURL = this.URL + '/spgateway/callback?from=NotifyURL';
    this.ClientBackURL = 'http://localhost:8080/order';
  }

  genDataChain(TradeInfo) {
    const results = [];
    for (const kv of Object.entries(TradeInfo)) {
      results.push(`${kv[0]}=${kv[1]}`);
    }
    // console.log('result log', results.join('&'));
    return results.join('&');
  }

  createMpgAesEncrypt(TradeInfo) {
    const encrypt = crypto.createCipheriv('aes256', this.HashKey, this.HashIV);
    const enc = encrypt.update(this.genDataChain(TradeInfo), 'utf8', 'hex');
    return enc + encrypt.final('hex');
  }

  createMpgAesDecrypt(TradeInfo) {
    const decrypt = crypto.createDecipheriv(
      'aes256',
      this.HashKey,
      this.HashIV
    );
    decrypt.setAutoPadding(false);
    const text = decrypt.update(TradeInfo, 'hex', 'utf8');
    const plainText = text + decrypt.final('utf8');
    let result = plainText.replace(/[\x00-\x20]+/g, '');
    return result;
  }

  createMpgShaEncrypt(TradeInfo) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${this.HashKey}&${TradeInfo}&HashIV=${this.HashIV}`;

    return sha
      .update(plainText)
      .digest('hex')
      .toUpperCase();
  }

  getTradeInfo(Amt, Desc, email) {
    // console.log('===== getTradeInfo =====');
    // console.log(Amt, Desc, email);
    // console.log('==========');

    const data = {
      MerchantID: this.MerchantID, // 商店代號
      RespondType: 'JSON', // 回傳格式
      TimeStamp: Date.now(), // 時間戳記
      Version: 1.5, // 串接程式版本
      MerchantOrderNo: Date.now(), // 商店訂單編號
      LoginType: 0, // 智付通會員
      OrderComment: 'OrderComment', // 商店備註
      Amt: Amt, // 訂單金額
      ItemDesc: Desc, // 產品名稱
      Email: email, // 付款人電子信箱
      ReturnURL: this.ReturnURL, // 支付完成返回商店網址
      NotifyURL: this.NotifyURL, // 支付通知網址/每期授權結果通知
      ClientBackURL: this.ClientBackURL // 支付取消返回商店網址
    };

    // console.log('===== getTradeInfo: data =====')
    // console.log(data)

    const mpgAesEncrypt = this.createMpgAesEncrypt(data);
    const mpgShaEncrypt = this.createMpgShaEncrypt(mpgAesEncrypt);

    // console.log('===== getTradeInfo: mpgAesEncrypt, mpgShaEncrypt =====')
    // console.log(mpgAesEncrypt)
    // console.log(mpgShaEncrypt)

    const tradeInfo = {
      MerchantID: this.MerchantID, // 商店代號
      TradeInfo: mpgAesEncrypt, // 加密後參數
      TradeSha: mpgShaEncrypt,
      Version: 1.5, // 串接程式版本
      PayGateWay: this.PayGateWay,
      MerchantOrderNo: data.MerchantOrderNo
    };

    // console.log('===== getTradeInfo: tradeInfo =====')
    // console.log(tradeInfo)

    return tradeInfo;
  }
}

module.exports = Trade;
