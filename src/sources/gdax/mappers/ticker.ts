import { Big } from "big.js";
import { TickerData } from "../../../types";

const map = (event: GdaxTickerMessage & BufferMessage) => {
  if (event.type !== "ticker") {
    throw new Error(`Type not supported: ${event.type}`);
  }

  const data: TickerData = {
    eTime: new Date(event.time).getTime(),
    iTime: event.$its,
    pair: event.product_id,
    price: new Big(event.price),
    side: event.side,
    volume: new Big(event.last_size || 0),
    volume24: new Big(event.volume_24h),
    source: "gdax"
  };

  return data;
};

export { map };
