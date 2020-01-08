# E-commerce Website Back-end Server

[![Build Status](https://travis-ci.org/libterty/ecommerce_backend.svg?branch=dev)](https://travis-ci.org/libterty/ecommerce_backend)
[![Coverage Status](https://coveralls.io/repos/github/libterty/ecommerce_backend/badge.svg?branch=master)](https://coveralls.io/github/libterty/ecommerce_backend?branch=master)

E-commerce Website Back-end Server 使用 Express.js + MySQL 建立的電子商務後端API SERVER，開發階段會部署在Heroku，量產階段會Migrate到Kubernetes/AWS上。專案以TDD方式開發API確保每一個Feature的功能性都是正常，Integration會等後續要盡量產前大致Function確認後才會執行。

## Features - 專案功能

- 消費者 CRUD - 使用者資訊瀏覽、使用者資訊修改、使用者登出/登入、商品瀏覽、加入購物車、創建訂單、修改訂單、刪除訂單、結帳付款、訂單瀏覽
- 管理員 CRUD - 商品管理、庫存管理、訂單管理、優惠券管理、銷售管理、呆帳管理、系統提醒功能
- 使用 mocha / chai / sinon / supertest 完成單元測試
- 使用 nyc / coveralls 檢視測試結果覆蓋率，測試覆蓋率維持 90% 以上
- 使用 TravisCI 實踐自動化測試和自動化部署流程
- 使用 Docker-compose 實踐 Artifacts Management，建立一致的環境
- 使用 Swagger 自動化產出API文件
- 使用 pm2 的 cluster mode 做production版本的進程管理與監控，執行錯誤自動重啟，負載平衡與提升效能
- 使用 Redis 儲存 session 到緩存
- 串接第三方藍新金流，快速接入多種支付方式
- 使用 cors 實作前後端分離跨域 session，訪客不需要登入即可加入購物車
- 使用 JSON Web Tokens 實作跨域認證
- 使用 Google API / OAuth 2.0 / nodemailer 實現 Email 通知功能
- 使用 multer 對接前後端檔案程式
- 使用 imgur API，實作上傳圖片功能
- 使用 bcrypt 處理使用者密碼
- 使用 dotenv 設定環境變數

## DB Structure - 資料庫架構規劃

- [關聯式資料庫](https://www.lucidchart.com/documents/edit/9c515ee3-b3a8-4e79-8120-d4d179c84914/0_0?shared=true)

## Swagger API - API文件並可用於接口測試

- [Swagger API 文件](https://secret-brushlands-82653.herokuapp.com/api-docs/)

![image](https://github.com/libterty/ecommerce_backend/blob/dev/assests/Swagger-example.png)

## 使用 pm2 做production版本的進程管理與監控

![image](https://github.com/libterty/ecommerce_backend/blob/dev/assests/pm2-monitor.png)

## Environment SetUp - 環境建置

- [Node.js](https://nodejs.org/en/)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io)
- [Docker](https://www.docker.com)
- [pm2](https://pm2.io)

## Installing - 使用Node專案安裝流程

1. 打開你的 terminal，Clone 此專案至本機電腦

```bash
git clone https://github.com/libterty/ecommerce_backend.git
```

2. 安裝 npm 套件，下載專案相依套件

```bash
npm i
```

3. 環境變數設定，新增.env檔把敏感資訊放入其中

```bash
JWT_SECRET=
imgur_id=
URL= HOST DOMIAN
MERCHANT_ID= 藍新金流商店 ID
HASH_KEY= 藍新金流商店 HASH_KEY
HASH_IV= 藍新金流商店 HASH_IV
GMAIL_ACCOUNT=
clientId= GCP clientId
clientSecret= GCP clientSecret
refreshToken= GCP GMAIL API refreshToken
testEmail=
PM2_SECRET_KEY= 如果你有要使用pm2 plus請在此放入
PM2_PUBLIC_KEY= 如果你有要使用pm2 plus請在此放入
```

4. 資料庫設定

```bash
create DATABASE ec_web;
create DATABASE ec_web_test;
```

```bash
npx sequelize db:migrate
npx sequelize db:migrate --env test
```

5. 建立種子檔案

```bash
npx sequelize db:seed:all
```

6. 測試

本專案使用 Mocha 做單元測試，Istanbul/nyc 計算程式覆蓋率。

```bash
npm test
```

7. 啟動應用程式，執行 index.js 檔案

```bash
npm start
```

8. 在瀏覽器開啟 http://localhost:3000

## Installing - 使用Docker專案安裝流程 (目前還在修改中以符合Kubernetes設定)
覺得上述流程很麻煩的話，可以使用我們的 Docker image

1. 下載Docker image
```bash
docker pull libterty8186/server_web
```

2. 啟動專案
```bash
docker-compose up --build
```

3. 在瀏覽器開啟 http://localhost:3000

# 貢獻者
- [11](https://github.com/libterty)
- [Mina](https://github.com/mpragnarok)
- [Ethan](https://github.com/HuangMinShi)