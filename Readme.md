# E-commerce Website Back-end Server

[![Build Status](https://travis-ci.org/libterty/ecommerce_backend.svg?branch=dev)](https://travis-ci.org/libterty/ecommerce_backend)
[![Coverage Status](https://coveralls.io/repos/github/libterty/ecommerce_backend/badge.svg?branch=master)](https://coveralls.io/github/libterty/ecommerce_backend?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/libterty/ecommerce_backend/blob/master/LICENCE)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/libterty8186/server_web)
![Docker Pulls](https://img.shields.io/docker/pulls/libterty8186/server_web)

E-commerce Website Back-end Server 使用 Express.js + MySQL + MongoDB + Redis + pm2 + Docker-Swarm 建立的高擴展性後端API SERVER，搭配 [E-commerce Website Front-end](https://github.com/libterty/ecommerce_frontend) 後端專案，打造一個全方位的電商網站。
開發階段後端API Server部署在[Heroku](https://secret-brushlands-82653.herokuapp.com/api)，量產階段部署在[aws](http://3.133.137.175/api)上 (AWS暫時關閉中已超出本月免費流量）。專案以TDD方式開發API確保每一個Feature的功能性都是正常，Integration會等後續要盡量產前大致Function確認後才會執行。

## Features - 專案功能

- 消費者 CRUD - 使用者資訊瀏覽、使用者資訊修改、使用者登出/登入、商品瀏覽、加入購物車、創建訂單、修改訂單、刪除訂單、結帳付款、訂單瀏覽
- 管理員 CRUD - 商品管理、庫存管理、訂單管理、優惠券管理、銷售管理、呆帳管理、系統提醒功能、系統日誌
- 使用 mocha / chai / sinon / supertest 完成單元測試
- 使用 nyc / coveralls 檢視測試結果覆蓋率，測試覆蓋率維持 90% 以上
- 使用 TravisCI 實踐自動化測試和自動化部署流程
- 使用 docker 實踐 Artifacts Management，建立一致的環境
- 使用 docker-swarm 建立cluster並部署到 AWS EC2 
- 使用 Swagger 自動化產出API文件
- 使用 pm2 的 cluster mode 做production版本的進程管理與監控，執行錯誤自動重啟，負載平衡與提升效能
- 使用 Redis 儲存 session 到緩存
- 使用 Redis 製作 Global Cache 快取機制
- 使用 jump consistent hash 一致性哈希演算法運用在db sharding
- 使用 loadtest 做 Performance Testing / Load Testing
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
- [MongoDB](https://www.mongodb.com)
- [Redis](https://redis.io)
- [Docker](https://www.docker.com)
- [pm2](https://pm2.io)

## Environment Variable - 環境參數

```bash
JWT_SECRET=
imgur_id=
URL= // your instance url
MERCHANT_ID= // 藍新金流商店ID
HASH_KEY= // 藍新金流商店HASH_KEY
HASH_IV= // 藍新金流商店HASH_IV
GMAIL_ACCOUNT= // GMAIL_ACCOUNT
clientId= // GCP的clientId
clientSecret= // GCP的clientSecret
refreshToken= // GCP的refreshToken
testEmail= // testEmail
PM2_SECRET_KEY= // PM2的SECRET_KEY
PM2_PUBLIC_KEY= // PM2的PUBLIC_KEY
JAWSDB_URL= // RDBMS url
MONGODB_URI= // NOSQL MONGODB url
REDIS_CACHE_URL= // REDIS url
REDIS_URL= // REDIS url
```

## Installing - 使用Node專案安裝流程

1. 打開你的 terminal，Clone 此專案至本機電腦

```bash
git clone https://github.com/libterty/ecommerce_backend.git
```

2. 安裝 npm 套件，下載專案相依套件

```bash
npm i
```

3. 資料庫設定

MySQL

```bash
create DATABASE ec_web;
create DATABASE ec_web_test;
```

```bash
npx sequelize db:migrate
npx sequelize db:migrate --env test
```

MongoDB

```bash
mongo
mongod
```

Redis

```bash
// 確認有連線到local server
redis-server
```

```bash
// 操作redis資料庫cli指令
redis-cli
```

4. 建立種子檔案

```bash
npx sequelize db:seed:all
```

5. 測試

本專案使用 Mocha 做單元測試，Istanbul/nyc 計算程式覆蓋率。

```bash
npm test
```

6. 啟動應用程式，執行 index.js 檔案

```bash
npm start
```

9. 在瀏覽器開啟 http://localhost/api

## Installing - 使用Docker專案安裝流程
覺得上述流程很麻煩的話，可以使用我們的 Docker image

1. 下載Docker image
```bash
docker pull libterty8186/server_web
```

2. Build專案
```bash
docker build -t libterty8186/server_web:latest --env <- adding env ->
```

3. 啟動專案
```bash
docker run libterty8186/server_web:latest
```

3. 在瀏覽器開啟 http://localhost/api

## Performance Testing/Load Testing

```bash
npm i loadtest -g
```

```bash
// 兩者指令二擇一，依你的需求
npm run dev

pm2 start -i 4 index.js --watch
```

```bash
loadtest -n 1000 -c 10 -H "authorization: bear <- token ->" http://localhost/api/<-endpoint->
```

# Contribution
- [11](https://github.com/libterty)
- [Mina](https://github.com/mpragnarok)
- [Ethan](https://github.com/HuangMinShi)

# CopyRight
Copyright © 2020, MAYNOOTH. Released under the MIT License.