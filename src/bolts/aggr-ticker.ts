import * as eep from "eep";
import * as envalid from "envalid";
import { createRedis } from "../services/redis";
import { ExchangeAggregated } from "./types";
import { toSecond, toMinute } from "./aggr-utils";
import { createGdaxStats } from "./aggr-gdax";
import { createOkexStats } from "./aggr-okex";
import { createBinanceStats } from "./aggr-binance";

const DEFAULT_EXPIRATION_SECONDS = 60 * 15;
const DEFAULT_EXPIRATION_MINUTES = 60 * 60 * 24 * 15;
const DEFAULT_REDIS_PUB_CHANNEL_PREFIX = "aggr";

const configurationVars = {
  DEBUG: envalid.bool({
    devDefault: true
  }),
  EXPIRATION_SECONDS: envalid.num({
    default: DEFAULT_EXPIRATION_SECONDS
  }),
  EXPIRATION_MINUTES: envalid.num({
    default: DEFAULT_EXPIRATION_MINUTES
  }),
  REDIS_PUB_CHANNEL_PREFIX: envalid.str({
    default: DEFAULT_REDIS_PUB_CHANNEL_PREFIX
  })
};

const env = envalid.cleanEnv(process.env, configurationVars);

const redis = createRedis();

const createWindow = (aggregatorFn: any, windowTime: number, unit: string, redisKeyPrefix: string) => {
  const window = eep.EventWorld.make()
    .windows()
    .monotonic(aggregatorFn(unit), new eep.CountingClock());

  const expirationSeconds = unit === "s" ? env.EXPIRATION_SECONDS : env.EXPIRATION_MINUTES;

  window.on("emit", (v: Map<string, ExchangeAggregated>) => {
    const p = redis.pipeline();
    for (const [, stats] of v) {
      const time = stats.time;
      const key = `${redisKeyPrefix}.${stats.pair}.${windowTime}${unit}.${time}`;
      const json = JSON.stringify(stats);
      p.set(key, json);
      p.expire(key, expirationSeconds);
      p.publish(`${env.REDIS_PUB_CHANNEL_PREFIX}.${windowTime}${unit}.${redisKeyPrefix}.${stats.pair}`, json);
    }
    p.publish(`${env.REDIS_PUB_CHANNEL_PREFIX}.${windowTime}${unit}.${redisKeyPrefix}.all`, JSON.stringify([...v]));
    p.exec();
  });

  return window;
};

const gdax1s = createWindow(createGdaxStats, 1, "s", "gdax");
const gdax1m = createWindow(createGdaxStats, 1, "m", "gdax");
const okex1s = createWindow(createOkexStats, 1, "s", "okex");
const okex1m = createWindow(createOkexStats, 1, "m", "okex");
const binance1s = createWindow(createBinanceStats, 1, "s", "binance");
const binance1m = createWindow(createBinanceStats, 1, "m", "binance");

let lastSecondGdax: number;
let lastMinuteGdax: number;
let lastSecondOkex: number;
let lastMinuteOkex: number;
let lastSecondBinance: number;
let lastMinuteBinance: number;

const execute: SpoutMessageHandler = async (_pattern, _channel, message) => {
  const m = JSON.parse(message) as SpoutMessage;

  let t: number;
  let ts: number;
  let tm: number;

  t = Date.now();
  // if (m.$source === "gdax") {
    // const gm = m as SpoutMessage & GdaxTickerMessage;
    // t = new Date(gm.time).getTime();
    ts = toSecond(t);
    tm = toMinute(t);
  // } else if (m.$source === "okex") {
    // const gm = m as SpoutMessage & OkexSpotPriceMessage;
    // t = gm.data.timestamp;
    // ts = toSecond(t);
    // tm = toMinute(t);
  // } else if (m.$source === "binance") {
    // const gm = m as SpoutMessage & BinanceTickerMessage;
    // t = gm.E;
    // ts = toSecond(t);
    // tm = toMinute(t);
  // } else {
    // return;
  // }

  if (m.$source === "gdax") {
    if (ts !== lastSecondGdax) {
      gdax1s.tick();
      lastSecondGdax = ts;
    }
    if (tm !== lastMinuteGdax) {
      gdax1m.tick();
      lastMinuteGdax = tm;
    }
    gdax1s.enqueue(m);
    gdax1m.enqueue(m);
  } else if (m.$source === "okex") {
    if (ts !== lastSecondOkex) {
      okex1s.tick();
      lastSecondOkex = ts;
    }
    if (tm !== lastMinuteOkex) {
      okex1m.tick();
      lastMinuteOkex = tm;
    }
    okex1s.enqueue(m);
    okex1m.enqueue(m);
  } else if (m.$source === "binance") {
    if (ts !== lastSecondBinance) {
      binance1s.tick();
      lastSecondBinance = ts;
    }
    if (tm !== lastMinuteBinance) {
      binance1m.tick();
      lastMinuteBinance = tm;
    }
    binance1s.enqueue(m);
    binance1m.enqueue(m);
  }
};

export { execute };
