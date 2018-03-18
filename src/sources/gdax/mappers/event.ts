const map = (message: string) => {
  const event = JSON.parse(message) as BufferMessage & GdaxTickerMessage;

  // We only care about ticker events for now
  if (event.type !== "ticker") {
    return;
  }

  return {
    ...event,
    $pair: event.product_id
  };
};

export { map };
