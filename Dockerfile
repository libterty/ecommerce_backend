FROM node:12
WORKDIR /usr/src/app
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]