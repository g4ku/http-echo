FROM node:lts

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY *.js ./
COPY *.proto ./

EXPOSE 3000
CMD [ "node", "main.js" ]