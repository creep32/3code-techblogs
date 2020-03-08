FROM node:12.14.0-alpine3.11

COPY / /opt/app

WORKDIR /opt/app

RUN npm install --production

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]
