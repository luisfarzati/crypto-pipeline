FROM node:8 as builder

WORKDIR /src

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY ./ ./

RUN ./node_modules/.bin/tsc

FROM keymetrics/pm2:8 as runtime

RUN apk add --update libc6-compat

WORKDIR /opt/pipeline

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/.build ./.build
COPY --from=builder /src/public ./public
COPY --from=builder /src/process.json .

CMD ["pm2-runtime", "process.json"]
