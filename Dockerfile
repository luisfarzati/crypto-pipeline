FROM node:alpine as builder

WORKDIR /src

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY ./ ./

RUN ./node_modules/.bin/tsc

FROM keymetrics/pm2:latest-alpine as runtime

RUN apk add --update libc6-compat

WORKDIR /opt/pipeline

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/.build ./.build
COPY --from=builder /src/process.json .

CMD ["pm2-runtime", "process.json"]