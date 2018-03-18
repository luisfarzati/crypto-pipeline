// seconds 300 data points
// minute as much as we can store

// incoming pair, compare to 15mins ago

// extend redis with ssd
import * as envalid from "envalid";
import { Big } from "big.js";
import { LRUMap } from "lru_map";
import { createRedis } from "../services/redis";
import { createLogger } from "../services/logger";
import { Pipeline } from "ioredis";
import * as eep from "eep";

// const second = (ts: number) => Math.floor(ts / 1000) * 1000;
// const minute = (ts: number) => Math.floor(ts / 1000 / 60) * 1000 * 60;

// const avg = (count = 0, total = new Big(0), n: string) => total.plus(n).div(count + 1);

// const max = (highest = new Big(0), n: string) => {
//   const num = new Big(n);
//   return highest.lt(num) ? num : highest;
// };

// const min = (lowest: Big | undefined, n: string) => {
//   const num = new Big(n);
//   if (lowest === undefined) {
//     return num;
//   }
//   return num.lt(lowest) ? num : lowest;
// };

// const gdaxSeconds = new LRUMap<string, Exchange<Gdax>>(5);
// const okexSeconds = new LRUMap<string, Exchange<Okex>>(5);

// const redis = createRedis();

// type hmsetFunction = (key: string, obj: any) => void;

// setInterval(() => {
//   const gdax = gdaxSeconds.oldest;
//   if (!gdax || gdaxSeconds.size === 1) {
//     return;
//   }
//   gdaxSeconds.delete(gdaxSeconds.oldest.key);

//   const okex = gdaxSeconds.oldest;
//   if (!gdax || gdaxSeconds.size === 1) {
//     return;
//   }
//   gdaxSeconds.delete(gdaxSeconds.oldest.key);

//   const key = `s${gdax.key}`;

//   const pipeline = redis.pipeline();
//   const hmset = pipeline.hmset.bind(pipeline) as hmsetFunction;
//   gdax.value.forEach((value, pair) => hmset(key, value));
// }, 800);

// const start = async (environment = process.env) => {
//   process.stdout.write(`${String.fromCharCode(27)}]0;aggr${String.fromCharCode(7)}`);

//   const logger = createLogger(`aggr`);
//   const redisSub = createRedis();

//   redisSub.psubscribe("feed.*");

//   redisSub.on("pmessage", (pattern, channel, json) => {
//     const emitterMessage = JSON.parse(json) as SpoutMessage;

//     const sec = second(Date.now()).toString();

//     if (emitterMessage.$source === "okex") {
//       const m = emitterMessage as SpoutMessage & OkexSpotPriceMessage;
//       const pairs = okexSeconds.get(sec) || new Map<string, Okex>();
//       const prev: Partial<Okex> = pairs.get(m.$pair) || {
//         count: 0
//       };
//       const data: Okex = {
//         count: prev.count! + 1,
//         averageBuy: avg(prev.count, prev.averageBuy, m.data.buy),
//         averageSell: avg(prev.count, prev.averageSell, m.data.sell),
//         averageVol: avg(prev.count, prev.averageVol, m.data.vol),
//         high: max(prev.high, m.data.high),
//         highestBuy: max(prev.highestBuy, m.data.buy),
//         highestSell: max(prev.highestSell, m.data.sell),
//         highestVol: max(prev.highestVol, m.data.vol),
//         last: m.data.last,
//         low: min(prev.low, m.data.low),
//         lowestBuy: min(prev.lowestBuy, m.data.buy),
//         lowestSell: min(prev.lowestSell, m.data.sell),
//         lowestVol: min(prev.lowestVol, m.data.vol)
//       };
//       pairs.set(m.$pair, data);
//       okexSeconds.set(sec, pairs);
//     } else if (emitterMessage.$source === "gdax") {
//       const m = emitterMessage as SpoutMessage & GdaxTickerMessage;
//       const pairs = gdaxSeconds.get(sec) || new Map<string, Gdax>();
//       const prev: Partial<Gdax> = pairs.get(m.$pair) || {
//         count: 0
//       };
//       const data: Gdax = {
//         count: prev.count! + 1,
//         average_best_ask: avg(prev.count, prev.average_best_ask, m.best_ask),
//         average_best_bid: avg(prev.count, prev.average_best_bid, m.best_bid),
//         average_last_size: avg(prev.count, prev.average_last_size, m.last_size),
//         average_price: avg(prev.count, prev.average_price, m.price),
//         average_volume_24h: avg(prev.count, prev.average_volume_24h, m.volume_24h),
//         highest_best_ask: max(prev.highest_best_ask, m.best_ask),
//         highest_best_bid: max(prev.highest_best_bid, m.best_bid),
//         highest_last_size: max(prev.highest_last_size, m.last_size),
//         highest_price: max(prev.highest_price, m.price),
//         highest_volume_24h: max(prev.highest_volume_24h, m.volume_24h),
//         lowest_best_ask: min(prev.lowest_best_ask, m.best_ask),
//         lowest_best_bid: min(prev.lowest_best_bid, m.best_bid),
//         lowest_last_size: min(prev.lowest_last_size, m.last_size),
//         lowest_price: min(prev.lowest_price, m.price),
//         lowest_volume_24h: min(prev.lowest_volume_24h, m.volume_24h)
//       };
//       pairs.set(m.$pair, data);
//       gdaxSeconds.set(sec, pairs);
//     }
//   });
// };

// if (module.parent == null) {
//   start();
// }

// export { start };
