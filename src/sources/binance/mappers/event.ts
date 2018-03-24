const CHANNEL_PAIR_REGEX = /^(.+?)(BTC|USDT?)$/;

const map = (message: string) => {
  const event = JSON.parse(message) as BufferMessage & BinanceTickerMessage;

  if (event.e !== "24hrTicker") {
    return;
  }

  // We only care about *BTC or *USD[T] for now
  const [, left, right] = event.s.match(CHANNEL_PAIR_REGEX) || Array();

  if (!left || !right) {
    return;
  }

  return {
    ...event,
    $pair: `${left}-${right}`
  };
};

export { map };
