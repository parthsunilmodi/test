FROM node:alpine

# Install yarn and other dependencies via apk
RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

RUN mkdir -p /usr/src/eduro-app && chown -R node:node /usr/src/eduro-app

WORKDIR /usr/src/eduro-app

COPY package.json dist ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
