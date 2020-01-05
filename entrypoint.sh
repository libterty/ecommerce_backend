#!/usr/bin/env sh

npm install
npx sequelize db:migrate --env production
npm start