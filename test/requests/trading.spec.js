const crypto = require('crypto');
const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
const Trade = require('../../util/trading');
const trade = new Trade();
require('dotenv').config();

describe('# Trading', () => {
  context('# When Request Trade', () => {
    describe('Request genDataChain', () => {
      const data = {
        MerchantID: 'test1test1', // 商店代號
        RespondType: 'JSON', // 回傳格式
        TimeStamp: Date.now(), // 時間戳記
        Version: 1.5, // 串接程式版本
        MerchantOrderNo: Date.now(), // 商店訂單編號
        LoginType: 0, // 智付通會員
        OrderComment: 'OrderComment', // 商店備註
        Amt: 3700, // 訂單金額
        ItemDesc: 1, // 產品名稱
        Email: 'test1@example.com', // 付款人電子信箱
        ReturnURL: 'http://localhost:3000/ReturnURL', // 支付完成返回商店網址
        NotifyURL: 'http://localhost:3000/NotifyURL', // 支付通知網址/每期授權結果通知
        ClientBackURL: 'http://localhost:3000/ClientBackURL' // 支付取消返回商店網址
      };

      it('Should return results as a string which contains data', () => {
        const result = trade.genDataChain(data);
        expect(result).not.to.equal(undefined);
        expect(typeof result).to.equal('string');
        expect(result.includes('test1@example.com')).to.equal(true);
      });
    });

    describe('Request createMpgAesEncrypt', () => {
      const data = {
        MerchantID: 'test1test1', // 商店代號
        RespondType: 'JSON', // 回傳格式
        TimeStamp: Date.now(), // 時間戳記
        Version: 1.5, // 串接程式版本
        MerchantOrderNo: Date.now(), // 商店訂單編號
        LoginType: 0, // 智付通會員
        OrderComment: 'OrderComment', // 商店備註
        Amt: 3700, // 訂單金額
        ItemDesc: 1, // 產品名稱
        Email: 'test1@example.com', // 付款人電子信箱
        ReturnURL: 'http://localhost:3000/ReturnURL', // 支付完成返回商店網址
        NotifyURL: 'http://localhost:3000/NotifyURL', // 支付通知網址/每期授權結果通知
        ClientBackURL: 'http://localhost:3000/ClientBackURL' // 支付取消返回商店網址
      };

      it('Should return hash results when we call the function', () => {
        const result = trade.createMpgAesEncrypt(data);
        expect(result).not.to.equal(
          '6ea5e45b3add401555ce4b130d53147afc8ac30e5f628015fd2d1e0a1a44def42ceb5e7367db68b88e3a545280d4584835c5392e5961b4d3e436320fb5518748ebd8204c942f66d15f6293ccd0d2460e590261f84e0e02b5eb8f2c505395482312b37944669759596fb3d477ee9486f4885b2cabc2f6bf16efcb3f0441d1ca40ae3de8518e37cce662a85c8d779ced4e80d15e4c1edce28f0df009c7bb26a137dbb3f3fe2c6c3048f350043093d310eae147266c773a2200e440f504fee08d4de909d14ee66cadc6f11579f851d06161af0fd90b2db20a8ab46f86a2882259d42df2e380126807c2372bc7c71468df5cd499458db0b525ddbe9003636cfa5769278a762dfd6deebab55d3e32501bc14843358d5d3582fca8f88c9f7952fbefcc6244d99164aa8f22ca827f9d9e8ec4670ebbc5dfb3c574a0cb0428fd2d6e66ea6a42ff1fc8e41a7e4e0ad875e629ac27'
        );
      });
    });

    describe('Request createMpgAesDecrypt', () => {
      const data = {
        MerchantID: 'test1test1', // 商店代號
        RespondType: 'JSON', // 回傳格式
        TimeStamp: Date.now(), // 時間戳記
        Version: 1.5, // 串接程式版本
        MerchantOrderNo: Date.now(), // 商店訂單編號
        LoginType: 0, // 智付通會員
        OrderComment: 'OrderComment', // 商店備註
        Amt: 3700, // 訂單金額
        ItemDesc: 1, // 產品名稱
        Email: 'test1@example.com', // 付款人電子信箱
        ReturnURL: 'http://localhost:3000/ReturnURL', // 支付完成返回商店網址
        NotifyURL: 'http://localhost:3000/NotifyURL', // 支付通知網址/每期授權結果通知
        ClientBackURL: 'http://localhost:3000/ClientBackURL' // 支付取消返回商店網址
      };
      const mpgAesEncrypt = trade.createMpgAesEncrypt(data);

      it('Should return Decrypt Data hex when we call the function', () => {
        const data = trade.createMpgAesDecrypt(mpgAesEncrypt);
        expect(data.includes('test1test1')).to.equal(true);
        expect(data.includes('test1@example.com')).to.equal(true);
      });
    });

    describe('Request createMpgShaEncrypt', () => {
      const data = {
        MerchantID: 'test1test1', // 商店代號
        RespondType: 'JSON', // 回傳格式
        TimeStamp: Date.now(), // 時間戳記
        Version: 1.5, // 串接程式版本
        MerchantOrderNo: Date.now(), // 商店訂單編號
        LoginType: 0, // 智付通會員
        OrderComment: 'OrderComment', // 商店備註
        Amt: 3700, // 訂單金額
        ItemDesc: 1, // 產品名稱
        Email: 'test1@example.com', // 付款人電子信箱
        ReturnURL: 'http://localhost:3000/ReturnURL', // 支付完成返回商店網址
        NotifyURL: 'http://localhost:3000/NotifyURL', // 支付通知網址/每期授權結果通知
        ClientBackURL: 'http://localhost:3000/ClientBackURL' // 支付取消返回商店網址
      };
      const mpgAesEncrypt = trade.createMpgAesEncrypt(data);

      it('Should return hash hex when we call the function', () => {
        const data = trade.createMpgShaEncrypt(mpgAesEncrypt);
        expect(data).not.to.equal(
          'D14C996FEE9D0A77DF0D3779178EA90700402CE7524C8F8AE655E9DB964F156D'
        );
      });
    });

    describe('Request getTradeInfo', () => {
      it('Should return hash hex when we call the function', () => {
        const data = trade.getTradeInfo(37000, 1, 'test1@example.com');
        expect(data.MerchantID).not.to.equal(null);
        expect(data.TradeInfo).not.to.equal(
          'c1a03290ae379d857440a64f1d1ff02af46a897b528c784d54dd278e7a797f4e5c7bb2e6afe21f9a20f0d491a33564dd175905cb68fec6235e760cc645af6559315f6ec389ab4539251f7c8a2c703f773e4e4a6c506ba8c3d0959569037226c8ae0ecdce6aee631e900eadb466126d37c840d18b4888c771e3405f339755d4f73d7a0f59549e60e7f13a84a1e767c29fa7e6c7b6e6e1a5522169aac95572e1999d66c7947b84495c28c35428dcf211d4261823d69ee4dff49ef926b8e6e0ffb06c125e2fd5dce9a573b4afff9125b1628258520cfcdc1f1c4321679abcba81dc8133469324ac88a3be043f110d8896245c1927bc6753f365a6aa4ce7a1e231d4ec8a67410236feadbd4c254eb6060449d62063d679243a4eca0cd248fefe0c020b1b0a30f17151d72313ea2e05929c6c3747166cce31ca15a1c657de6d49e1dd'
        );
        expect(data.TradeSha).not.to.equal(
          '6A5854D162FB8452D274AF8BEDD41CAA88A904C9E2FBB60ABC2EAB9DB7983EE0'
        );
        expect(data.PayGateWay).to.equal(
          'https://ccore.spgateway.com/MPG/mpg_gateway'
        );
      });
    });
  });
});
