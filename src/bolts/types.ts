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

export interface BinanceAggregated extends ExchangeAggregated {
  highest_p: Big; // price change
  lowest_p: Big; // price change
  average_p: Big; // price change

  highest_P: Big; // price change percent
  lowest_P: Big; // price change percent
  average_P: Big; // price change percent

  highest_w: Big; // weighted average price
  lowest_w: Big; // weighted average price
  average_w: Big; // weighted average price

  highest_x: Big; // previous day's close price
  lowest_x: Big; // previous day's close price
  average_x: Big; // previous day's close price

  highest_c: Big; // current day's close price
  lowest_c: Big; // current day's close price
  average_c: Big; // current day's close price

  highest_Q: Big; // close trade's quantity
  lowest_Q: Big; // close trade's quantity
  average_Q: Big; // close trade's quantity

  highest_b: Big; // best bid price
  lowest_b: Big; // best bid price
  average_b: Big; // best bid price

  highest_B: Big; // best bid quantity
  lowest_B: Big; // best bid quantity
  average_B: Big; // best bid quantity

  highest_a: Big; // best ask price
  lowest_a: Big; // best ask price
  average_a: Big; // best ask price

  highest_A: Big; // best bid quantity
  lowest_A: Big; // best bid quantity
  average_A: Big; // best bid quantity

  highest_o: Big; // open price
  lowest_o: Big; // open price
  average_o: Big; // open price

  highest_h: Big; // high price
  lowest_h: Big; // high price
  average_h: Big; // high price

  highest_l: Big; // low price
  lowest_l: Big; // low price
  average_l: Big; // low price

  highest_v: Big; // total traded base asset volume
  lowest_v: Big; // total traded base asset volume
  average_v: Big; // total traded base asset volume

  highest_q: Big; // total traded quote asset volume
  lowest_q: Big; // total traded quote asset volume
  average_q: Big; // total traded quote asset volume

  // highest_O: number; // statistics open time
  // lowest_O: number; // statistics open time
  // average_O: number; // statistics open time

  // highest_C: number; // statistics close time
  // lowest_C: number; // statistics close time
  // average_C: number; // statistics close time

  // highest_F: number; // first trade id
  // lowest_F: number; // first trade id
  // average_F: number; // first trade id

  // highest_L: number; // last trade id
  // lowest_L: number; // last trade id
  // average_L: number; // last trade id

  // highest_n: number; // total number of trades
  // lowest_n: number; // total number of trades
  // average_n: number; // total number of trades
}

export type AggregatedView<T> = Map<string, T>;
