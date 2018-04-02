/** @type {Map<String,Map<SourceExchange,ExchangeAggregated>>} */
const dashboardPairs = new Map();

/** @type {Set<String>} */
const sources = new Set();

/**
 * onPriceUpdate is called on every price update from any of the exchanges.
 */
onPriceUpdate((data) => {
  sources.add(data.source);

  /** @type {Map<String,ExchangeAggregated>} */
  const pairs = new Map(data.message);

  for (let [pair, value] of pairs.entries()) {
    pair = pair.replace("USDT", "USD");
    const exchanges = dashboardPairs.get(pair) || new Map();
    exchanges.set(data.source, value);
    dashboardPairs.set(pair, exchanges);
  }

  const sorted = Array.from(dashboardPairs.keys()).sort();

  clear();
  print(`${"".padStart(12)}  ${[...sources.values()].map((n) => n.padStart(14)).join("  ")}\n`);

  for (const pair of sorted) {
    let newest = 0;
    print(pair.padStart(12).concat("  "));
    for (const source of sources.values()) {
      /** @type {OkexAggregated|GdaxAggregated|BinanceAggregated} */
      const value = dashboardPairs.get(pair).get(source);
      if (value) {
        const price = value.average_best_ask || value.averageSell || value.average_a;
        newest = Math.max(newest, value.time);
        print(price.slice(0, 14).padStart(14));
        print("  ");
      } else {
        print(`${"".padStart(14)}  `);
      }
    }
    print(`\n`);
  }
});
