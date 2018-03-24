// seconds 300 data points
// minute as much as we can store

// incoming pair, compare to 15mins ago

// extend redis with ssd
import * as envalid from "envalid";
import { Big } from "big.js";
import { LRUMap } from "lru_map";
import { createRedis } from "../services/redis";
import { createLogger } from "../services/logger";

const configurationVars = {
  HOST: envalid.host({ default: "0.0.0.0" }),
  PORT: envalid.port({ default: 3679 })
};

const bigMin = (x: Big, y: Big) => (x.lt(y) ? x : y);
const okexRex = /^ok_sub_spot_(.+?)_ticker$/;

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  process.stdout.write(`${String.fromCharCode(27)}]0;lower${String.fromCharCode(7)}`);

  const logger = createLogger(`lower`);

  const redis = createRedis();
  const redisSub = createRedis();
  redisSub.psubscribe("feed.*");

  const gdax = new LRUMap<string, Map<string, Big>>(4);
  const okex = new LRUMap<string, Map<string, Big>>(4);

  redisSub.on("pmessage", (pattern, channel, message) => {
    const m = JSON.parse(message);

    if (channel.startsWith("feed.gdax")) {
      const minute = Math.floor(new Date(m.time).getTime() / 1000 / 60) * 1000 * 60;
      const pair = m.product_id;
      const price = new Big(m.best_ask);
      const map = gdax.get(minute.toString()) || new Map<string, Big>();
      const last = map.get(pair);
      const lowest = bigMin(last || price, price);
      if (!last || price.lt(last)) {
        logger.info("gdax", minute, pair, last || "-", "=>", lowest);
      }
      redis.set(`sell.minute.gdax.${pair}.${minute}`, lowest.toString());
      map.set(pair, lowest);
      gdax.set(minute.toString(), map);
    } else {
      const minute = Math.floor(m.data.timestamp / 1000 / 60) * 1000 * 60;
      const [, rawPair] = m.channel.match(okexRex) || Array();
      if (!rawPair) {
        return logger.error("Invalid pair", m.channel);
      }
      const pair = rawPair.replace(/_/, "-").toUpperCase();
      const price = new Big(m.data.sell);
      const map = okex.get(minute.toString()) || new Map<string, Big>();
      const last = map.get(pair);
      const lowest = bigMin(last || price, price);
      if (!last || price.lt(last)) {
        logger.info("okex", minute, pair, last || "-", "=>", lowest);
      }
      redis.set(`sell.minute.okex.${pair}.${minute}`, lowest.toString());
      map.set(pair, lowest);
      okex.set(minute.toString(), map);
    }
  });
};

if (module.parent == null) {
  start();
}

export { start };
