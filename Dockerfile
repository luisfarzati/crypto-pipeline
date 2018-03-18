FROM node:alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY ./ ./

EXPOSE 8091
EXPOSE 9191

ENTRYPOINT ["yarn"]