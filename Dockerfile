FROM node:latest
WORKDIR /usr/src/app
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY package.json .
RUN npm install
RUN npm install -g nodemon
COPY . .
EXPOSE 3000
CMD ["npm", "start"]