import { BinanceAggregated } from "./types";
import { min, avg, max, toSecond, toMinute } from "./aggr-utils";

export const createBinanceStats = (unit: string) => {
  let pairs: Map<string, BinanceAggregated>;

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

  const accumulate = (m: SpoutMessage & BinanceTickerMessage) => {
    const pair = m.$pair;
    const t = m.E;

    const aggr: Partial<BinanceAggregated> = pairs.get(pair) || {
      timestamps: [],
      time: fn(t),
      unit,
      count: 0,
      pair
    };
    const c = aggr.count!;
    const data: BinanceAggregated = {
      timestamps: [...aggr.timestamps!, t],
      time: aggr.time!,
      unit: aggr.unit!,
      count: c + 1,
      pair: aggr.pair!,

      average_a: avg(aggr.count, aggr.average_a, m.a),
      average_A: avg(aggr.count, aggr.average_A, m.A),
      average_b: avg(aggr.count, aggr.average_b, m.b),
      average_B: avg(aggr.count, aggr.average_B, m.B),
      average_c: avg(aggr.count, aggr.average_c, m.c),
      average_h: avg(aggr.count, aggr.average_h, m.h),
      average_l: avg(aggr.count, aggr.average_l, m.l),
      average_o: avg(aggr.count, aggr.average_o, m.o),
      average_p: avg(aggr.count, aggr.average_p, m.p),
      average_P: avg(aggr.count, aggr.average_P, m.P),
      average_q: avg(aggr.count, aggr.average_q, m.q),
      average_Q: avg(aggr.count, aggr.average_Q, m.Q),
      average_v: avg(aggr.count, aggr.average_v, m.v),
      average_w: avg(aggr.count, aggr.average_w, m.w),
      average_x: avg(aggr.count, aggr.average_x, m.x),

      highest_a: max(aggr.highest_a, m.a),
      highest_A: max(aggr.highest_A, m.A),
      highest_b: max(aggr.highest_b, m.b),
      highest_B: max(aggr.highest_B, m.B),
      highest_c: max(aggr.highest_c, m.c),
      highest_h: max(aggr.highest_h, m.h),
      highest_l: max(aggr.highest_l, m.l),
      highest_o: max(aggr.highest_o, m.o),
      highest_p: max(aggr.highest_p, m.p),
      highest_P: max(aggr.highest_P, m.P),
      highest_q: max(aggr.highest_q, m.q),
      highest_Q: max(aggr.highest_Q, m.Q),
      highest_v: max(aggr.highest_v, m.v),
      highest_w: max(aggr.highest_w, m.w),
      highest_x: max(aggr.highest_x, m.x),

      lowest_a: min(aggr.lowest_a, m.a),
      lowest_A: min(aggr.lowest_A, m.A),
      lowest_b: min(aggr.lowest_b, m.b),
      lowest_B: min(aggr.lowest_B, m.B),
      lowest_c: min(aggr.lowest_c, m.c),
      lowest_h: min(aggr.lowest_h, m.h),
      lowest_l: min(aggr.lowest_l, m.l),
      lowest_o: min(aggr.lowest_o, m.o),
      lowest_p: min(aggr.lowest_p, m.p),
      lowest_P: min(aggr.lowest_P, m.P),
      lowest_q: min(aggr.lowest_q, m.q),
      lowest_Q: min(aggr.lowest_Q, m.Q),
      lowest_v: min(aggr.lowest_v, m.v),
      lowest_w: min(aggr.lowest_w, m.w),
      lowest_x: min(aggr.lowest_x, m.x)
    };
    pairs.set(pair, data);
  };

  const emit = () => pairs;

  const make = () => createBinanceStats(unit);

  return {
    init,
    accumulate,
    emit,
    make
  };
};
