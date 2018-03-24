import * as eep from "eep";
import { createLogger } from "../services/logger";
import { createRedis } from "../services/redis";
import { ExchangeAggregated } from "./types";
import { toSecond, toMinute } from "./aggr-utils";
import { createGdaxStats } from "./aggr-gdax";
import { createOkexStats } from "./aggr-okex";
import { createBinanceStats } from "./aggr-binance";

const logger = createLogger("1sec");
const redis = createRedis();

const EXPIRATION_SECONDS = 60 * 60 * 24 * 10;

const EXPIRATION_MINUTES = 60 * 60 * 24 * 30;

const createWindow = (aggregatorFn: any, windowTime: number, unit: string, redisKeyPrefix: string) => {
  const window = eep.EventWorld.make()
    .windows()
    .monotonic(aggregatorFn(unit), new eep.CountingClock());

  const expirationSeconds = unit === "s" ? EXPIRATION_SECONDS : EXPIRATION_MINUTES;

  window.on("emit", (v: Map<string, ExchangeAggregated>) => {
    const p = redis.pipeline();
    for (const [, stats] of v) {
      const time = stats.time;
      const key = `${redisKeyPrefix}.${stats.pair}.${windowTime}${unit}.${time}`;
      p.set(key, JSON.stringify(stats));
      p.expire(key, expirationSeconds);
      const gt = new Date(time).toLocaleTimeString();
      logger.info(redisKeyPrefix, gt, stats.pair, stats.timestamps.length, stats.count);
    }
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

logger.info("pair", "msg ts", "sec ts", "min ts", "time");

const execute: SpoutMessageHandler = async (pattern, channel, message: string) => {
  const m = JSON.parse(message) as SpoutMessage;

  let t: number;
  let ts: number;
  let tm: number;

  if (m.$source === "gdax") {
    const gm = m as SpoutMessage & GdaxTickerMessage;
    t = new Date(gm.time).getTime();
    ts = toSecond(t);
    tm = toMinute(t);
  } else if (m.$source === "okex") {
    const gm = m as SpoutMessage & OkexSpotPriceMessage;
    t = gm.data.timestamp;
    ts = toSecond(t);
    tm = toMinute(t);
  } else if (m.$source === "binance") {
    const gm = m as SpoutMessage & BinanceTickerMessage;
    t = gm.E;
    ts = toSecond(t);
    tm = toMinute(t);
  } else {
    return;
  }
  logger.info(m.$source, m.$pair, t, ts, tm, new Date(ts).toLocaleTimeString());

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
