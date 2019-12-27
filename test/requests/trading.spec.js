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
        })

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
                expect(result).not.to.equal('6ea5e45b3add401555ce4b130d53147afc8ac30e5f628015fd2d1e0a1a44def42ceb5e7367db68b88e3a545280d4584835c5392e5961b4d3e436320fb5518748ebd8204c942f66d15f6293ccd0d2460e590261f84e0e02b5eb8f2c505395482312b37944669759596fb3d477ee9486f4885b2cabc2f6bf16efcb3f0441d1ca40ae3de8518e37cce662a85c8d779ced4e80d15e4c1edce28f0df009c7bb26a137dbb3f3fe2c6c3048f350043093d310eae147266c773a2200e440f504fee08d4de909d14ee66cadc6f11579f851d06161af0fd90b2db20a8ab46f86a2882259d42df2e380126807c2372bc7c71468df5cd499458db0b525ddbe9003636cfa5769278a762dfd6deebab55d3e32501bc14843358d5d3582fca8f88c9f7952fbefcc6244d99164aa8f22ca827f9d9e8ec4670ebbc5dfb3c574a0cb0428fd2d6e66ea6a42ff1fc8e41a7e4e0ad875e629ac27');
            });
        })

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
                const data = trade.createMpgAesEncrypt(mpgAesEncrypt);
                expect(data).not.to.equal('3fe15aa66cdfea43474c9f72cd36a27b0c314f479aaef5c4357362bc9b1e27c3003f35c6f042226053f65a76d16af0e13ebe11171b0ac6f2624e8153b09b39cbc554fc60cfb1ab2eebc460ed6f79d7943daec239bd5bd2e4c3f96dfc4c98172125d76757fb310d76efaeec7b7fb0f18557ccec8c51aef2fe6bef8bf28dfc121ca36d543e551344419e302ce3c5cb697d1d103bd79b77b9277bacde25bdc8aec4b9786220d56b7ed66b4169182c1e98e7f121d73468f467a413d24c3228b8de9beece8adb47eb5f4aa8d4bd7e0ac865fadcf3560ff1d2ce403be24dee745359241823460bbd6f1d679ca879d573467aaad812ee4df5ae12a16423b73a90272f19f588f0545cf2dec2ee6ae804547e06813570deab2b42d0e382339c539a4914a17d2e9cf4908edb8a4f13926ca5fda00077a7757867158adf91de042ba9fdfa0acaffd5aa884fcc33c6911c6a2ab519239aa28c614969c816734fb503e8bfa95e30f5c35878d7b9d0d971831553233fa4b9260f693d05942a7e933be1712f489e51cf4bc48dc7a13f3252918352ee589aa4f96313b1f7273f283fa0504d0ab3df518bef426a2322a70a76e42b6bb3252c7b9191ee2db658756b07ea7bc96f00da6ddc1d3f6427bb35263243f0ba7ce281ea9323262ac0ce8007c0cba0119bf0b8577a3268cbb99bcb10655848b355fd30df76fb34da0d6f4f10cd9f7d453d20ecc17a695943800729bb91bd75f33ee4c171af9092607d92039a8f82f03bb146334bc6a224dcd69b769fe48b603873d4501d08da998ebfd58455ba7e9ae28f0fe983c0b7b2d21705f823504ca6978a3795651c63c78d4a3cecd27cfadce4a53ba73579baee848dfb79e0a02802295fbbe8487b99863312b91d09ca30a1bcd4202f790f47eb0948cf31b0a976ce7a47a596654f1242c9660da32dbb1fc8babe111bfbc1af12709ecc53f67fdbd2ffcc78d7fa22451ee215eb7ed61cbb2a9d3ca959c1c4fc0aacb20137d10d56e4ba5cc778b4494d5e0c9e8dbc659f08a6ad0d58c9f4a5e6a0afb70eeaf72bc2d61d2ae3db4da4f1d7ca94b64f4760838e4f8d7c2e86cfc3b59e7dabd1a60ea48aa2b65569948b21a699ec282c2927d36159c89cd045e0d83da4b02d89787e77c3ccc146e7cb9da28f60a21f736cf297de9069c0384b9d6b6fdecd94f83ad46ecdf6c5a18a36867eaa8ba44d70156422f2b2dc0d30e1a5092d6836aa63f0b19d833e88b64fdd578ccd561a0fac17478c4c8afc8011c0bc9709ddd1c7b3211c5b253746e56a18db3f6acd1e6376242bd308a98a3df49a0e394ef8fec9e72b980ddbab62a5d2f167d7359146e1ea8fc87d94370fd9eacbb335f8986cc9c954956864d81c55b211399d038271876b199c16f3f31b42db98f63b6317c7024dd424ec9d199d05346a5397ca642e2bb5c35d543984a1a5e2b586a8e4823503ec59b3c3d527c564c3af634cccc1a3f8827c889aa8156dceeedf4715db5088b740621c9357ff665d81f1c43a6f7c5763fea9f5eec492355e55be91961c0122fc2da485c76b7b534d892fb41c9670de97de086c388dc5482cac12e13b2d246f70e41e957c13fcfed2bcad18c03d04cd7d0f79bd00228ae7b3ec2d74d34a05a0b314645a782582b7988d3c80e571e2b601bfb273d574d3e99cb8e1fcbc505e6e3dbe1c3084cd13a0359b51af65ee0d97f0da440b453be5ba1e95bb6a461b40fd23dcfb9a01c1e7f284c2362263bb227fe6856911e2b9a0acffd7dfcfccd185c626e17c604479f672213ccaf784fe3ec0c5ab109336e03445b06621c148949adaa60d910a872ad01a520600a691f5b066bb50041ff697483113e704e1e24a4a05e8b9175ac68b7e782c4a2b5df6c67c2a4ffc1d61edbde413d90971f606f7230777f517a82252814ff1ca08f6479025105f365fec5672d47919416af8f115828aa14a5c1efc26d0fffa39f0e8f898a16e2d649bff9aea95f5f6e9637cc83fcd0e533d10cadfbdeb610e405a19b3c63efeada9c6cc474ab49cf11d3270d864c4a65cf1e8fd633f295557f29d90e83a5e0f63e4e311562fa1afc04ec27ad1f22e1b6998d5e49c4370fed2f390ebcbc0324b7a78c4cc1d1ec657f25a0372705eb2f77a98475bbb8ef7d2b697305b835a1e4494368b0fb79a621a2c8bf023cbab7220ad20b386b806b037da56d60661ca3b7910d80e8963dbf941be5a5035d0bf1ddf40d31003152a01445ff2699b01b81699a94fc8dbb388bce22db002e3e744474303dcc0cac35aa1bcde58f77264f7e8116d4fa16009e270c652a8f2cdedc4f91db75bf9aefbb3dc9f7497f21c9a5da0fecb6f43dbb4901cf761c79024cfc010e30d76fea8412e691099aaec9690ac263086bc206dcf31178788b0b7209406dda2dbd195665b1db9492192fd0925b40ef05a9c3b7ec8659bb7be64d8954f63e518cb2e33b3de68b7106a46b0d3e607fd4a26a79ecd9b1d49cb6e8077cd1ce67db51e787190eb71fd6ce9dac9570981d00d88bd037229d81ee883c9d3d7c3417d33d0cdfa5b1d4e07715577edc35a7d04c08cbf560d718cb19a6594a42c9f412fac8ac06240c17e4fc1161452eb5c736ace95304c3bde7115e6ffd7e67208fa9d046b2bfdb99d45894c6956c281061f76b6158705eb4629dce8ee2f8add6d6e80c184561440847d6cc01503ddb5000bfdf8e16ccd9801ac9ff83e6975934aaa7f58c97815a92a9e0e1e3f6461cc15244f39b309e40e3383e74bd3a8a9b4955d448bc54b2f40be60cf253b10a77e35f1fa5509e5983abac8e0895f9b3ab22749c2d5e9c5a9841b36904942c9e887387324b122e09400d3ddc3043941e8149bb297bff826a5e9b46f4fe25575743319b427df4412a088af85245f389e263a13282c69d500be70d8e0e6fa553f92d12e965617ae978593f997de05c6df8b11d5d00b4b6c191ed912c77a38cca8b64301725bbaeb1722609e4e157c3c309dc3eefa7e29eb0362d3442a8c60d443df4d7c18d6ba58f44baa7e073fb6e1eb59e3ceefada702a9b6d189d0e88cb51cef0d862d5e0032a9daec99240fd21c976b414dcd84cef26b6d948802a76f26195975b730124dd94bad927058c3dfc4e8e4569fc865053212800875b03b765225c179d7e91429394476f24b93694ea96949612fc72a4c86bdf0a5b869ac5820c56a6c00d3b2798e2f236e2ff260166983b5a51d569a273b5e3f2a6a17b381df794d1c87a1a94c6946a8d65f752d314f2ab1b23104b5e8782ef44aea8591c0084fe3c4328f2fea08828375eb72f6efbd606f016bc18d26c968284afafeec6e4d259656893777bd3712b2314fda40adaeb07fe84322472a5c4f15996ac396aacca8a1814a7e4c41fe7147e265e82584a599387665780dfeef70e3b80582c2e75df2ff25a74eda27841b98d85dbf0090efe5747835b1f9955d37553961c6ac2c6dec7329dafda6e5227e7a3fed64ae001ba8cf4b75c209b830eecf83e062a10809cf9f14d1eee7a355a46c59baf507466abb11f7dee3cf66ab7376b4c4c7f6724c878cfbd4813468368abbc7ae7e02c0a91fe8aa7711eb1641fc159a284764566b1a7d995ddbb85e4e69e4ff076add13d5bc885b4f58f6eb121f9f347d2e4d3f3b891763f4cd6755e9d1afcb8d48ed75b95340f00328a5e8dae050529d27081b9a86a3035e5cc83adda52e40b91d38e35b381c83e7979b70a1c67a2c72ba66d61ae009ef6f6a0aada09d58875dde4895444bb48ece12f5c82e66f830110c63a740654fc3bcb6a41a427798bf78a23a49aca860517e6e692a04cab9be73d9264c892106e800fbdf6255c0403744c2236afe1884997899dbb2c1b84b4d7bc0bfdeb920cd9c7fa39620ba080ca048a1031d9515a710c99c52b41cb3a7433e532e4bc3368afd01564b6e2a302554e5353c80d172b5c72efe889fa969477053e1b858aa277cda0f96017d2ad70349a7e0a803b3341066ff7520659f86f5565b20d09553ccb4505ea9a799a0c11ce657a34d040f2bef23e8ef1de674804962815dad1334c8cd8d5ee7c0fce87fc3414e0140de4d76eac325b3c9f1137b7c4cac8ffe0bc3f76daf23d22aab767855759bbbc95910c97883b494ba134c9970f42db134bf2c66b73a42cdfce7ad1ca913d694b6c8057426adadbcb5b60df78a8f75a488229ab373944cf3a6dc30d8c6ed0188ceb544d721eded3db363601d0ca8be46fd400cebda5c782082508c12a97cec2151d43121386269c5c04ba9d14d4c2123a2139c032de04ed304fd156bb1e0866615dc9a9266140ffcb3515c5b138eba223955959ae4d6dd860373aff26b31f5ba0051b286718862eabb6ec1ac24c25b8621fb6c467eaa73e668d91f20d598dc6eb0d4fd3bdebbcde4d58907fd469bb1d845a2d26df029bd6ecbe42ab6489944c8eab0ce22eeaf79ccc4161c84b4422d9a977a75e72ea80f0e858f977350b66a0faa3d4776e75fbeef590e355be796de8ea4b74cea8e38c9042019183af2cc284c433c7f20d758777d63be06fd9f1998dbd0124ac7d0f0853da0da8d6dc83b062bd1ee4399f770cb0504fce10fc7afb1b13a1140b3e4bc3332d76c88ec55a2937196c9b0ef3e6090760b1386140c64e055bf16f6c9fd3189ebc4085788695b4952604027e3e58d34ab9a35c228743fcbe1708da8433588ebdb39286a8d0b7118025f010e65e692fce458ea1f8ba89d33df766122d9edb8295779f6e0070c2b96172de8f0ec0bd46040b90e8b3dc8fae45bc13ecc4a35ca5f2cf6ebd846c47476338cb15d74dbddfb25dbd3ed30c865539d51c0edfdcafb1e76ba61ef7c96f38c634d7125d807057fecdef49097d3bd493fadea4f4db8209a22c2ef1b8fa297add8fea3c18292b72c58f49179b08ab61a419a1c1895311aba10afa2b6eb8a87950cc795ed926c4cde4feb0b9c3504474ccdedbe9dc3234c27f66b6e15324da75559a8af345303d8d1c86c478ac28fe5f957b6e72ffac91a4aeecf8887991516ea362ff311d4eda511a41aefcb58798d58f474ba31fbeb2788d4274b0d1ef02978981b5de5cc4c1653b6bb63bf0d0653eb05153f4e8920854fee7ab0c210c7a49992fb401b923fda49e1bbea54fd89a8438c094663002ae211c390515b521ed32054b2c629c61522563fc0a6e4d488e71284f451ba1c03254bd620389cdd1000fc647f40a14cac160dcca10c8a47d2ad5787a893b3157dbfd5d829c1ed98851a035ee95bd43972f8313fa40bc02f3cc00c5756db26c831fb7231e0bf9f7146e7c7a827bb732fb8275bcc524cd090b8e81bd3e9a03dc51de18019d82dff054057ec53e006225b1570c45463475408498efc503c60d289d89bfa8bcdb73b10e7e39a739701fc9c8a6ec50961994aef198db0b8bcda986f5130b5353c156b5ac792536103f0331d4a6624e70bfdc2655dd34f758cf6d45654899b1a2cb509a4e330cd27bff93eb2a92bd15e688ce8548087b2f954b4244049cbce978411cfd81ede46c78876897cabba1061955364b729a4407c5dfea48f2468f04e27cd5ec02994c2cdfeb70890')
            });
        })

        describe('Request getTradeInfo', () => {
            it('Should return hash hex when we call the function', () => {
                const data = trade.getTradeInfo(37000, 1, 'test1@example.com');
                expect(data.MerchantID).not.to.equal(null);
                expect(data.TradeInfo).not.to.equal('c1a03290ae379d857440a64f1d1ff02af46a897b528c784d54dd278e7a797f4e5c7bb2e6afe21f9a20f0d491a33564dd175905cb68fec6235e760cc645af6559315f6ec389ab4539251f7c8a2c703f773e4e4a6c506ba8c3d0959569037226c8ae0ecdce6aee631e900eadb466126d37c840d18b4888c771e3405f339755d4f73d7a0f59549e60e7f13a84a1e767c29fa7e6c7b6e6e1a5522169aac95572e1999d66c7947b84495c28c35428dcf211d4261823d69ee4dff49ef926b8e6e0ffb06c125e2fd5dce9a573b4afff9125b1628258520cfcdc1f1c4321679abcba81dc8133469324ac88a3be043f110d8896245c1927bc6753f365a6aa4ce7a1e231d4ec8a67410236feadbd4c254eb6060449d62063d679243a4eca0cd248fefe0c020b1b0a30f17151d72313ea2e05929c6c3747166cce31ca15a1c657de6d49e1dd');
                expect(data.TradeSha).not.to.equal('6A5854D162FB8452D274AF8BEDD41CAA88A904C9E2FBB60ABC2EAB9DB7983EE0');
                expect(data.PayGateWay).to.equal('https://ccore.spgateway.com/MPG/mpg_gateway');
            });
        })
    })
});