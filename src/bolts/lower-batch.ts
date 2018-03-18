import * as envalid from "envalid";
import * as csvStringify from "csv-stringify";
import * as csvTransform from "stream-transform";
import * as fs from "fs";
import { Big } from "big.js";
import { createRedis } from "../services/redis";
import { createLogger } from "../services/logger";

const configurationVars = {
  HOST: envalid.host({ default: "0.0.0.0" }),
  PORT: envalid.port({ default: 3679 })
};

const bigMin = (x: Big, y: Big) => (x.lt(y) ? x : y);

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  process.stdout.write(`${String.fromCharCode(27)}]0;lower-batch${String.fromCharCode(7)}`);

  const logger = createLogger(`lower-batch`);

  const exportMinutes = async () => {
    const redis = createRedis();
    const keys = await redis.keys("sell.minute.*");
    logger.info("total keys:", keys.length);

    const sorted = keys
      .map((k) => k.split(".").pop()!)
      .reduce((unique, k) => (unique.includes(k) ? unique : [...unique, k]), [] as string[])
      .map((k) => parseInt(k, 10))
      .sort()
      .slice(0, -2);

    logger.info("unique keys:", sorted.length);

    const transform = csvTransform((data: any) => data);
    const stringify = csvStringify({
      columns: ["minute", "pair", "gdax", "okex"]
    });
    transform.pipe(stringify).pipe(fs.createWriteStream("test.csv"));

    for (const minuteTs of sorted) {
      const minuteKeys = await redis.keys(`sell.minute.*.*.${minuteTs}`);
      for (const key of minuteKeys) {
        const [, , source, pair] = key.split(".");
        const price = await redis.get(key);
      }
    }
    transform.end();

    setTimeout(exportMinutes, 1000 * 60 * 5);
  };

  setImmediate(() => exportMinutes(), 0);
};

if (module.parent == null) {
  start();
}

export { start };
