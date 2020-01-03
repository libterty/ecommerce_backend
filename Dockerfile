FROM node:latest
WORKDIR /usr/src/app
RUN npm install -g nodemon
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]