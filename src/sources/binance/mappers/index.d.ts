// "e": "24hrTicker",
// "E": 1521753273985,
// "s": "ETHBTC",
// "p": "-0.00168600",
// "P": "-2.669",
// "w": "0.06241562",
// "x": "0.06325400",
// "c": "0.06149200",
// "Q": "0.07400000",
// "b": "0.06144000",
// "B": "0.24400000",
// "a": "0.06149200",
// "A": "0.11800000",
// "o": "0.06317800",
// "h": "0.06369500",
// "l": "0.06100000",
// "v": "117269.57000000",
// "q": "7319.45269251",
// "O": 1521666873980,
// "C": 1521753273980,
// "F": 45593158,
// "L": 45888933,
// "n": 295776

type BinanceMessageType = "24hrTicker";

interface BinanceMessage {
  readonly e: BinanceMessageType;
}

interface BinanceTickerMessage extends BinanceMessage {
  readonly e: "24hrTicker";
  readonly E: number; // timestamp
  readonly s: string; // symbol
  readonly p: string; // price change
  readonly P: string; // price change percent
  readonly w: string; // weighted average price
  readonly x: string; // previous day's close price
  readonly c: string; // current day's close price
  readonly Q: string; // close trade's quantity
  readonly b: string; // best bid price
  readonly B: string; // best bid quantity
  readonly a: string; // best ask price
  readonly A: string; // best bid quantity
  readonly o: string; // open price
  readonly h: string; // high price
  readonly l: string; // low price
  readonly v: string; // total traded base asset volume
  readonly q: string; // total traded quote asset volume
  readonly O: number; // statistics open time
  readonly C: number; // statistics close time
  readonly F: number; // first trade id
  readonly L: number; // last trade id
  readonly n: number; // total number of trades
}
