import { Big } from "big.js";

export interface ExchangeAggregated {
  timestamps: number[];
  count: number;
  time: number;
  unit: string;
  pair: string;
}

export interface OkexAggregated extends ExchangeAggregated {
  high: Big; // highest price
  low: Big; // lowest price
  last: string; // latest price

  highestVol: Big; // volume(the most recent 24 hours)
  lowestVol: Big; // volume(the most recent 24 hours)
  averageVol: Big; // volume(the most recent 24 hours)

  highestBuy: Big; // best bid
  lowestBuy: Big; // best bid
  averageBuy: Big; // best bid

  highestSell: Big; // best ask
  lowestSell: Big; // best ask
  averageSell: Big; // best ask
}

export interface GdaxAggregated extends ExchangeAggregated {
  highest_price: Big;
  lowest_price: Big;
  average_price: Big;

  highest_last_size: Big;
  lowest_last_size: Big;
  average_last_size: Big;

  highest_best_bid: Big;
  lowest_best_bid: Big;
  average_best_bid: Big;

  highest_best_ask: Big;
  lowest_best_ask: Big;
  average_best_ask: Big;

  highest_volume_24h: Big;
  lowest_volume_24h: Big;
  average_volume_24h: Big;
}

export type AggregatedView<T> = Map<string, T>;
