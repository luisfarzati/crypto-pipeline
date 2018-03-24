import { Big } from "big.js";
import { GdaxAggregated } from "./types";
import { min, avg, max, toSecond, toMinute } from "./aggr-utils";

export const createGdaxStats = (unit: string) => {
  let pairs: Map<string, GdaxAggregated>;

  let fn: (ts: number) => number;

  switch (unit) {
    case "s":
      fn = toSecond;
      break;
    case "m":
      fn = toMinute;
  }

  const init = () => {
    pairs = new Map();
  };

  const accumulate = (m: SpoutMessage & GdaxTickerMessage) => {
    const pair = m.$pair;
    const t = new Date(m.time).getTime();

    const aggr: Partial<GdaxAggregated> = pairs.get(pair) || {
      timestamps: [],
      time: fn(t),
      unit,
      count: 0,
      pair,
      sum_best_ask: new Big(0),
      sum_best_bid: new Big(0),
      sum_last_size: new Big(0),
      sum_price: new Big(0),
      sum_volume_24h: new Big(0)
    };
    const c = aggr.count!;
    const data: GdaxAggregated = {
      timestamps: [...aggr.timestamps!, t],
      time: aggr.time!,
      unit: aggr.unit!,
      count: c + 1,
      pair: aggr.pair!,
      sum_best_ask: aggr.sum_best_ask!.plus(m.best_ask),
      sum_best_bid: aggr.sum_best_bid!.plus(m.best_bid),
      sum_last_size: aggr.sum_last_size!.plus(m.last_size || aggr.sum_last_size!),
      sum_price: aggr.sum_price!.plus(m.price),
      sum_volume_24h: aggr.sum_volume_24h!.plus(m.volume_24h || aggr.sum_volume_24h!),
      average_best_ask: avg(c, aggr.sum_best_ask, m.best_ask),
      average_best_bid: avg(c, aggr.sum_best_bid, m.best_bid),
      average_last_size: avg(c, aggr.sum_last_size, m.last_size),
      average_price: avg(c, aggr.sum_price, m.price),
      average_volume_24h: avg(c, aggr.sum_volume_24h, m.volume_24h),
      highest_best_ask: max(aggr.highest_best_ask, m.best_ask),
      highest_best_bid: max(aggr.highest_best_bid, m.best_bid),
      highest_price: max(aggr.highest_price, m.price),
      lowest_best_ask: min(aggr.lowest_best_ask, m.best_ask),
      lowest_best_bid: min(aggr.lowest_best_bid, m.best_bid),
      lowest_price: min(aggr.lowest_price, m.price)
    };
    if (m.last_size !== undefined) {
      data.lowest_last_size = min(aggr.lowest_last_size, m.last_size);
      data.highest_last_size = max(aggr.highest_last_size, m.last_size);
    }
    if (m.volume_24h !== undefined) {
      data.lowest_volume_24h = min(aggr.lowest_volume_24h, m.volume_24h);
      data.highest_volume_24h = max(aggr.highest_volume_24h, m.volume_24h);
    }
    pairs.set(pair, data);
  };

  const emit = () => pairs;

  const make = () => createGdaxStats(unit);

  return {
    init,
    accumulate,
    emit,
    make
  };
};
