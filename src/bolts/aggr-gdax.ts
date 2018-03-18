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
      pair
    };
    const c = aggr.count!;
    const data = {
      timestamps: [...aggr.timestamps!, t],
      time: aggr.time!,
      unit: aggr.unit!,
      count: c + 1,
      pair: aggr.pair!,
      average_best_ask: avg(c, aggr.average_best_ask, m.best_ask),
      average_best_bid: avg(c, aggr.average_best_bid, m.best_bid),
      average_last_size: avg(c, aggr.average_last_size, m.last_size),
      average_price: avg(c, aggr.average_price, m.price),
      average_volume_24h: avg(c, aggr.average_volume_24h, m.volume_24h),
      highest_best_ask: max(aggr.highest_best_ask, m.best_ask),
      highest_best_bid: max(aggr.highest_best_bid, m.best_bid),
      highest_last_size: max(aggr.highest_last_size, m.last_size),
      highest_price: max(aggr.highest_price, m.price),
      highest_volume_24h: max(aggr.highest_volume_24h, m.volume_24h),
      lowest_best_ask: min(aggr.lowest_best_ask, m.best_ask),
      lowest_best_bid: min(aggr.lowest_best_bid, m.best_bid),
      lowest_last_size: min(aggr.lowest_last_size, m.last_size),
      lowest_price: min(aggr.lowest_price, m.price),
      lowest_volume_24h: min(aggr.lowest_volume_24h, m.volume_24h)
    };
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
