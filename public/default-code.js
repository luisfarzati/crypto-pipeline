let MAX_DIGITS = 8;

// Maps to use for storing pair-price tuples
let gdax = new Map();
let okex = new Map();

/**
 * onPriceUpdate is called on every price update from any of the exchanges.
 * message is an object in GDAX or OKEX format (see at the bottom of this code to see a reference for each format)
 */
onPriceUpdate((message) => {
  // A simple header that shows current time and latest message feed, just to make sure there is activity
  let s = ""
    .concat(new Date().toLocaleTimeString())
    .concat("  ")
    .concat(message.feed)
    .concat("\\n");
  s = s.concat("---------------------------------------------------------------------------------------\\n");

  // Try hover the cursor over the "source" property, you get smart insights about object properties
  if (message.source === "gdax") {
    let pair = message.data.product_id;
    let price = parseFloat(message.data.best_ask);
    gdax.set(pair, price);
  }

  if (message.source === "okex") {
    // OKEX stream has the pair embedded in the feed name, so we need to extract it
    let match = message.feed.match(/sub_spot_(.+?)_ticker$/);
    if (!match) return;

    // We normalize the name in uppercase and dash, e.g. ETH-BTC
    let pair = match[1].replace(/_/, "-").toUpperCase();
    let price = parseFloat(message.data.data.sell);
    okex.set(pair, price);
  }

  // We get a unique list of all pairs we collected until now
  let allPairs = Array.from(gdax.keys()).concat(Array.from(okex.keys()));
  let uniquePairs = allPairs.reduce((unique, pair) => (unique.includes(pair) ? unique : unique.concat(pair)), []);

  // Compare and calculate lower price for every pair
  uniquePairs.forEach((pair) => {
    let gdaxPrice = gdax.get(pair);
    let okexPrice = okex.get(pair);
    let lowerPrice, lowerPercent, whoHasLowerPrice;

    // We only compare if we received price datapoints from both exchanges
    if (gdaxPrice && okexPrice) {
      lowerPrice = Math.min(gdaxPrice, okexPrice);
      lowerPercent = lowerPrice / Math.max(gdaxPrice, okexPrice) * 100;
      whoHasLowerPrice = gdaxPrice === lowerPrice ? "GDAX" : "OKEX";
    }

    // Concatenate data to be printed for this pair line

    // Pair
    s = s.concat(pair.padEnd(8)).concat(" ");

    // Lower price and who has it
    if (lowerPrice) {
      // Exchange name
      s = s.concat(whoHasLowerPrice).concat(" ");
      // Price (first MAX_DIGITS digits)
      s = s
        .concat(
          lowerPrice
            .toString()
            .slice(0, MAX_DIGITS)
            .padStart(MAX_DIGITS)
        )
        .concat(" ");
      // Percent
      s = s
        .concat("(")
        .concat(
          lowerPercent
            .toString()
            .slice(0, MAX_DIGITS)
            .padStart(MAX_DIGITS)
        )
        .concat("%) ");
    } else {
      // Print space to preserve same column alignment
      s = s.concat("-".padEnd(25)).concat(" ");
    }

    s = s.concat("   ");

    // GDAX price or "-" if no price
    gdaxPrice = gdaxPrice || "-";
    s = s.concat("GDAX ");
    s = s.concat(
      gdaxPrice
        .toString()
        .slice(0, MAX_DIGITS)
        .padStart(MAX_DIGITS)
    );

    s = s.concat("   ");

    // OKEX price or "-" if no price
    okexPrice = okexPrice || "-";
    s = s.concat("OKEX ");
    s = s.concat(
      okexPrice
        .toString()
        .slice(0, MAX_DIGITS)
        .padStart(MAX_DIGITS)
    );

    s = s.concat("\\n");

    print(s);
  });
});

/**

OKEX object reference:

"feed": "feed.okex.ok_sub_spot_bch_btc_ticker",
"data": {
"binary": 0,
"channel": "ok_sub_spot_bch_btc_ticker",
"data": {
"dayHigh": "0.1201",
"dayLow": "0.1126",
"buy": "0.11466813",
"sell": "0.11506165",
"open": "0.11845608",
"close": "0.11483579",
"vol": "67450.12203744",
"last": "0.11483579",
"high": "0.1201",
"low": "0.1126",
"change": "-0.00362029",
"timestamp": 1520895766142
}
}

GDAX object reference:

"feed": "feed.gdax.BCH-BTC",
"data": {
"high_24h": "0.11950000",
"low_24h": "0.11471000",
"price": "0.11471000",
"side": "buy",
"volume_24h": "817.63695702",
"open_24h": "0.11882000",
"best_bid": "0.11469",
"best_ask": "0.11471",
"last_size": "0.01025603",
"type": "ticker",
"sequence": 58253681,
"product_id": "BCH-BTC",
"volume_30d": "31595.76502771",
"time": "2018-03-12T23:02:43.175000Z",
"trade_id": 158374,
}

**/
