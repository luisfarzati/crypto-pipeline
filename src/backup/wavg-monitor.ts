import * as envalid from "envalid";
import { Big } from "big.js";
import { createRedis } from "../services/redis";
import { createLogger } from "../services/logger";
import { TickerData } from "../types";
import { AggregatedStats, PriceVolume, SourceMap } from "./types";

const SOURCE_NAME = "wavg-mon";

const configurationVars = {
  REDIS_SUB_CHANNELS: envalid.str({ default: "wavg.*", example: "wavg.*" })
};

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  const logger = createLogger(`${SOURCE_NAME}`);

  const redisSub = createRedis({ ...process.env, ...env });
  redisSub.psubscribe(env.REDIS_SUB_CHANNELS, (err: any) => {
    if (err) {
      logger.error(err.message);
    } else {
      logger.info("subscription succeeded");
    }
  });

  let lastBuy: Partial<AggregatedStats> = {
    sources: {},
    wavg: new Big(0)
  };
  let lastSell: Partial<AggregatedStats> = {
    sources: {},
    wavg: new Big(0)
  };
  redisSub.on("pmessage", (pattern, channel, message) => {
    const data = JSON.parse(message) as AggregatedStats;

    if (data.pair !== "BTC-USD") {
      return;
    }

    data.wavg = new Big(data.wavg);

    process.stdout.write("\x1B[2J");

    const buy = data.side === "buy" ? (lastBuy = data) : lastBuy;
    const sell = data.side === "sell" ? (lastSell = data) : lastSell;
    const bp = buy.wavg!.toFixed(4);
    const sp = sell.wavg!.toFixed(4);
    const second = new Date(data.ts).toLocaleTimeString();

    const allSources = [...Object.keys(lastBuy.sources!), ...Object.keys(lastSell.sources!)];
    const uniqueSources = allSources.reduce(
      (unique, key) => (unique.includes(key) ? unique : unique.concat(key)),
      [] as string[]
    );
    const sorted = uniqueSources.sort();

    process.stdout.write(
      `${second.padStart(8)}${"buy avg".padStart(18)}${"".padStart(18 + 10)}${"sell avg".padStart(
        18
      )}\n`
    );
    process.stdout.write(
      `${"".padStart(8)}${bp.padStart(18)}${"".padStart(18 + 10)}${sp.padStart(18)}\n`
    );
    process.stdout.write(`${"-".repeat(8 + 18 + 18 + 10 + 18 + 18 + 10)}\n`);
    process.stdout.write(
      `${"source".padStart(8)}${"buy price".padStart(18)}${"volume".padStart(18)}${"".padStart(
        10
      )}${"sell price".padStart(18)}${"volume".padStart(18)}\n`
    );
    for (const source of uniqueSources) {
      const bSources = buy.sources![source] || [];
      const sSources = sell.sources![source] || [];
      const to = Math.max(bSources.length, sSources.length);
      for (let i = 0; i < to; i++) {
        process.stdout.write(`${source.padStart(8)}`);

        const bItem = bSources[i];
        if (bItem) {
          const sts = new Date(bItem.ts)
            .toISOString()
            .split("T")
            .pop()!
            .split(".")
            .shift()!;

          const p = new Big(bItem.p).toFixed(4);
          const v = new Big(bItem.v).toFixed(4);
          process.stdout.write(`${p.padStart(18)}${v.padStart(18)}${sts.padStart(10)}`);
        } else {
          process.stdout.write(`${"".padStart(18 + 18 + 10)}`);
        }

        const sItem = sSources[i];
        if (sItem) {
          const sts = new Date(sItem.ts)
            .toISOString()
            .split("T")
            .pop()!
            .split(".")
            .shift()!;
          const p = new Big(sItem.p).toFixed(4).padStart(11);
          const v = new Big(sItem.v).toFixed(4).padStart(11);
          process.stdout.write(`${p.padStart(18)}${v.padStart(18)}${sts.padStart(10)}`);
        }

        process.stdout.write("\n");
      }
    }

    // logger.info(
    //   data.pair,
    //   data.side.padEnd(4),
    //   data.ts,
    //   new Date(data.ts).toLocaleTimeString(),
    //   +data.wavg
    // );
  });
};

start();
