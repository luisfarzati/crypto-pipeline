import { Big } from "big.js";
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
      pair,
      sum_a: new Big(0),
      sum_A: new Big(0),
      sum_b: new Big(0),
      sum_B: new Big(0),
      sum_c: new Big(0),
      sum_h: new Big(0),
      sum_l: new Big(0),
      sum_o: new Big(0),
      sum_p: new Big(0),
      sum_P: new Big(0),
      sum_q: new Big(0),
      sum_Q: new Big(0),
      sum_v: new Big(0),
      sum_w: new Big(0),
      sum_x: new Big(0)
    };
    const c = aggr.count!;
    const data: BinanceAggregated = {
      timestamps: [...aggr.timestamps!, t],
      time: aggr.time!,
      unit: aggr.unit!,
      count: c + 1,
      pair: aggr.pair!,
      sum_a: aggr.sum_a!.plus(m.a),
      sum_A: aggr.sum_A!.plus(m.A),
      sum_b: aggr.sum_b!.plus(m.b),
      sum_B: aggr.sum_B!.plus(m.B),
      sum_c: aggr.sum_c!.plus(m.c),
      sum_h: aggr.sum_h!.plus(m.h),
      sum_l: aggr.sum_l!.plus(m.l),
      sum_o: aggr.sum_o!.plus(m.o),
      sum_p: aggr.sum_p!.plus(m.p),
      sum_P: aggr.sum_P!.plus(m.P),
      sum_q: aggr.sum_q!.plus(m.q),
      sum_Q: aggr.sum_Q!.plus(m.Q),
      sum_v: aggr.sum_v!.plus(m.v),
      sum_w: aggr.sum_w!.plus(m.w),
      sum_x: aggr.sum_x!.plus(m.x),

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
