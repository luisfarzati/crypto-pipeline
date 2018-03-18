import * as envalid from "envalid";
import { Big } from "big.js";
import { LRUMap } from "lru_map";
import { createRedis } from "../services/redis";
import { createLogger } from "../services/logger";
import { TickerData } from "../types";
import { AggregatedStats, PriceVolume, SourceMap } from "./types";

const SOURCE_NAME = "wavg";

const configurationVars = {
  REDIS_SUB_CHANNELS: envalid.str({ default: "ticker.*", example: "ticker.*" })
};

const bigMax = (x: Big, y: Big) => (x.gt(y) ? x : y);
const bigMin = (x: Big, y: Big) => (x.lt(y) ? x : y);

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  process.stdout.write(
    `${String.fromCharCode(27)}]0;${SOURCE_NAME.toUpperCase()}-data${String.fromCharCode(7)}`
  );

  const logger = createLogger(`${SOURCE_NAME}`);
  logger.info(`starting pipeline ${SOURCE_NAME}`);
  logger.info(`will subscribe to redis channels ${env.REDIS_SUB_CHANNELS}`);

  const redisSub = createRedis({ ...process.env, ...env });
  redisSub.psubscribe(env.REDIS_SUB_CHANNELS, (err: any) => {
    if (err) {
      logger.error(err.message);
    } else {
      logger.info("subscription succeeded");
    }
  });

  const last = new LRUMap<string, AggregatedStats>(5);

  const from = (data: TickerData, tsInSeconds: number) =>
    ({
      pair: data.pair,
      sources: {} as SourceMap,
      side: data.side,
      max: data.price,
      min: data.price,
      ts: tsInSeconds
    } as AggregatedStats);

  const parse = (message: string) => {
    const data = JSON.parse(message) as TickerData;
    return {
      ...data,
      price: new Big(data.price),
      volume: new Big(data.volume || 1) // TODO: review fix (last_size in GDAX undefined sometimes)
    } as TickerData;
  };

  const takeLatest = <T>(arr: T[]) => arr.slice(-1).pop();

  const redisPub = createRedis({ ...process.env, ...env });
  redisSub.on("pmessage", (pattern, channel, message) => {
    const data = parse(message);
    const tsInSeconds = Math.floor(data.eTime / 1000) * 1000;
    const key = `${tsInSeconds}${data.pair}${data.side}`;

    const L = last.get(key) || from(data, tsInSeconds);

    L.max = bigMax(L.max, data.price);
    L.min = bigMin(L.min, data.price);

    L.sources[data.source] = L.sources[data.source] || [];
    L.sources[data.source].push({
      p: data.price,
      v: data.volume24,
      ts: data.eTime
    } as PriceVolume);

    const sourceValues = Object.values(L.sources);

    // weighted average

    const priceSum = sourceValues.reduce((t, s) => {
      const mostRecent = takeLatest(s)!;
      return t.plus(mostRecent.p.times(mostRecent.v));
    }, new Big(0));
    const volumeSum = sourceValues.reduce((t, s) => {
      const mostRecent = takeLatest(s)!;
      return t.plus(mostRecent.v);
    }, new Big(0));
    L.wavg = priceSum.div(volumeSum);

    last.set(key, L);

    const json = JSON.stringify(L);
    redisPub.lpush("wavg", json);
    redisPub.publish(`wavg.${data.pair}`, json);
    // TODO: store historical
  });
};

if (module.parent == null) {
  start();
}

export { start };
