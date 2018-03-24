// const PAIR_TRANSLATE_MAP: any = {
//   eth_btc: "ETH-BTC",
//   ltc_btc: "LTC-BTC",
//   bch_btc: "BCH-BTC",
//   btc_usdt: "BTC-USDT"
// };

const CHANNEL_PAIR_REGEX = /ok_sub_spot_(.+?)_ticker/;

const map = (message: string) => {
  const event = JSON.parse(message) as BufferMessage & OkexSpotPriceMessage;

  const [, okexPair] = event.channel.match(CHANNEL_PAIR_REGEX) || Array();

  if (!okexPair) {
    return;
  }

  return {
    ...event,
    $pair: okexPair.replace(/_/, "-").toUpperCase()
  };
};

export { map };
