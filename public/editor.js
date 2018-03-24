require.config({ paths: { vs: "monaco-editor/min/vs" } });

fetch("default-code.js").then(function(R) {
  R.text().then(function(code) {
    initializeEditor({ code });
  });
});

function initializeEditor(options) {
  const opts = options;

  require(["vs/editor/editor.main"], function() {
    window.editor = monaco.editor.create(document.getElementById("container"), {
      base: "vs",
      inherit: true,
      value: opts.code,
      language: "javascript",
      theme: "vs-dark",
      lineNumbers: false,
      wordWrap: "off",
      minimap: {
        enabled: false
      }
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      declare type GdaxMessage = {
          source: 'gdax',
          feed: string,
          data: {
              "high_24h": string,
              "low_24h": string,
              "price": string,
              "side": 'buy' | 'sell',
              "volume_24h": string,
              "open_24h": string,
              "best_bid": string,
              "best_ask": string,
              "last_size": string,
              "type": string,
              "sequence": number,
              "product_id": 'ETH-BTC' | 'LTC-BTC' | 'BCH-BTC' | 'BTC-USD',
              "volume_30d": string,
              "time": string,
              "trade_id": number
          }
      }

      declare type OkexMessage = {
          source: "okex",
          feed: string,
          data: {
              channel: string,
              data: {
                  dayHigh: string,
                  dayLow: string,
                  buy: string,
                  sell: string,
                  open: string,
                  close: string,
                  vol: string,
                  last: string,
                  high: string,
                  low: string,
                  change: string,
                  timestamp: number
              }
          }
      }

      declare type PriceMessage = GdaxMessage | OkexMessage;

      declare type Handler = (m: PriceMessage) => void;

      declare function onPriceUpdate(h: Handler): void;
  `,
      "filename/sample.d.ts"
    );
  });
}
