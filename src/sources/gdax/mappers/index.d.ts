type GdaxMessageType =
  | "error"
  | "subscribe"
  | "subscriptions"
  | "unsubscribe"
  | "open"
  | "received"
  | "done"
  | "match"
  | "change"
  | "activate"
  | "heartbeat"
  | "ticker"
  | "snapshot"
  | "l2update";

interface GdaxMessage {
  readonly type: GdaxMessageType;
}

interface GdaxTickerMessage extends GdaxMessage {
  readonly type: "ticker";
  readonly trade_id: number;
  readonly sequence: number;
  readonly time: string;
  readonly product_id: string;
  readonly price: string;
  readonly side: "buy" | "sell";
  readonly last_size: string;
  readonly best_bid: string;
  readonly best_ask: string;
  readonly volume_24h: string;
}

interface GdaxHeartbeatMessage extends GdaxMessage {
  readonly type: "heartbeat";
  readonly sequence: number;
  readonly last_trade_id: number;
  readonly product_id: string;
  readonly time: string;
}

type GdaxAnyMessage = GdaxHeartbeatMessage | GdaxTickerMessage;
