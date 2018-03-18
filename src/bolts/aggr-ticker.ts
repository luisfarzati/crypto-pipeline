import * as envalid from "envalid";
import * as eep from "eep";
import { createLogger } from "../services/logger";
import { createRedis } from "../services/redis";
import { GdaxAggregated, ExchangeAggregated } from "./types";
import { Big } from "big.js";
import { createGdaxStats } from "./aggr-gdax";
import { toSecond, toMinute } from "./aggr-utils";
import { createOkexStats } from "./aggr-okex";

const logger = createLogger("1sec");
const redis = createRedis();

const createWindow = (aggregatorFn: any, windowTime: number, unit: string, redisKeyPrefix: string) => {
  const window = eep.EventWorld.make()
    .windows()
    .monotonic(aggregatorFn(unit), new eep.CountingClock());

  window.on("emit", (v: Map<string, ExchangeAggregated>) => {
    for (const [, stats] of v) {
      const time = stats.time;
      redis.set(`${redisKeyPrefix}.${stats.pair}.${windowTime}${unit}.${time}`, JSON.stringify(stats));
      const gt = new Date(time).toLocaleTimeString();
      logger.info(redisKeyPrefix, gt, stats.pair, stats.timestamps.length, stats.count);
    }
  });

  return window;
};

// createGdaxStats("s");
// const gdaxWindow1m = eep.EventWorld.make()
//   .windows()
//   .monotonic(createGdaxStats("m"), new eep.CountingClock());
// gdaxWindow1m.on("emit", (v: Map<string, GdaxAggregated>) => {
//   for (const [, stats] of v) {
//     const time = stats.time;
//     redis.set(`gdax.1m.${time}`, JSON.stringify(stats));
//     const gt = new Date(time).toLocaleTimeString();
//     logger.info(gt, stats.pair, stats.timestamps.length, stats.count);
//   }
// });

// setInterval(gdaxWindow1s.tick, 3000);

// const okexWindow1s = eep.EventWorld.make()
//   .windows()
//   .monotonic(createOkexStats("s"), new eep.CountingClock());

const gdax1s = createWindow(createGdaxStats, 1, "s", "gdax");
const gdax1m = createWindow(createGdaxStats, 1, "m", "gdax");
const okex1s = createWindow(createOkexStats, 1, "s", "okex");
const okex1m = createWindow(createOkexStats, 1, "m", "okex");

let lastSecondGdax: number;
let lastMinuteGdax: number;
let lastSecondOkex: number;
let lastMinuteOkex: number;

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
  }
};

export { execute };
