import { Big } from "big.js";
import { OkexAggregated } from "./types";
import { min, avg, max, toSecond, toMinute } from "./aggr-utils";

export const createOkexStats = (unit: string) => {
  let pairs: Map<string, OkexAggregated>;

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

  const accumulate = (m: SpoutMessage & OkexSpotPriceMessage) => {
    const pair = m.$pair;
    const t = m.data.timestamp;

    const aggr: Partial<OkexAggregated> = pairs.get(pair) || {
      timestamps: [],
      time: fn(t),
      unit,
      count: 0,
      pair,
      sumBuy: new Big(0),
      sumSell: new Big(0),
      sumVol: new Big(0)
    };
    const c = aggr.count!;
    const data = {
      timestamps: [...aggr.timestamps!, t],
      time: aggr.time!,
      unit: aggr.unit!,
      count: c + 1,
      pair: aggr.pair!,
      sumBuy: aggr.sumBuy!.plus(m.data.buy),
      sumSell: aggr.sumSell!.plus(m.data.sell),
      sumVol: aggr.sumVol!.plus(m.data.vol),
      averageBuy: avg(aggr.count, aggr.averageBuy, m.data.buy),
      averageSell: avg(aggr.count, aggr.averageSell, m.data.sell),
      averageVol: avg(aggr.count, aggr.averageVol, m.data.vol),
      high: max(aggr.high, m.data.high),
      highestBuy: max(aggr.highestBuy, m.data.buy),
      highestSell: max(aggr.highestSell, m.data.sell),
      highestVol: max(aggr.highestVol, m.data.vol),
      last: m.data.last,
      low: min(aggr.low, m.data.low),
      lowestBuy: min(aggr.lowestBuy, m.data.buy),
      lowestSell: min(aggr.lowestSell, m.data.sell),
      lowestVol: min(aggr.lowestVol, m.data.vol)
    };
    pairs.set(pair, data);
  };

  const emit = () => pairs;

  const make = () => createOkexStats(unit);

  return {
    init,
    accumulate,
    emit,
    make
  };
};
