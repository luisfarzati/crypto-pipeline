import { Big } from "big.js";
import { TickerData } from "../../../types";
import { SPOT_PRICE_CHANNEL_PREFIX } from "./types";

const channelPairRex = /ok_sub_spot_(.+?)_ticker/;

const PAIR_TRANSLATE_MAP: any = {
  eth_btc: "ETH-BTC",
  ltc_btc: "LTC-BTC",
  bch_btc: "BCH-BTC",
  btc_usdt: "BTC-USDT"
};

const map = (side: "sell" | "buy", event: OkexSpotPriceMessage & BufferMessage) => {
  const { $its, channel, data: eventData } = event;
  if (!channel.startsWith(SPOT_PRICE_CHANNEL_PREFIX)) {
    throw new Error(`Type not supported: ${channel}`);
  }
  const [, okexPair] = channel.match(channelPairRex) || Array();
  if (!okexPair) {
    throw new Error(`Could not extract pair from: ${channel}`);
  }
  const pair = PAIR_TRANSLATE_MAP[okexPair];
  if (!pair) {
    throw new Error(`Unknown pair: ${okexPair}`);
  }

  const data: TickerData = {
    eTime: eventData.timestamp,
    iTime: $its,
    pair,
    price: new Big(eventData[side]),
    side,
    volume: new Big(0),
    volume24: new Big(eventData.vol),
    source: "okex"
  };

  return data;
};

export { map };
