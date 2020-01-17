FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
EXPOSE 80
CMD ["npm", "start"]