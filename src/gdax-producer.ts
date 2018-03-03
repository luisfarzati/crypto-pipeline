import { EventEmitter } from "events"
import { WebsocketClient } from "gdax"
import { PriceData, Producer, ProducerEmitter } from "./producer"

interface GdaxOptions {
  pairs: string[]
  channels: string[]
}

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
  | "l2update"

interface GdaxMessage {
  type: GdaxMessageType
}

type GdaxTickerMessage = GdaxMessage & {
  type: "ticker"
  trade_id: number
  sequence: number
  time: "2017-09-02T17:05:49.250000Z"
  product_id: string
  price: string
  side: "buy" | "sell"
  last_size: string
  best_bid: string
  best_ask: string
}

type GdaxHeartbeatMessage = GdaxMessage & {
  type: "heartbeat"
  sequence: number
  last_trade_id: number
  product_id: string
  time: string
}

type GdaxMessageEventHandler = (
  data: GdaxHeartbeatMessage | GdaxTickerMessage
) => void

interface GdaxWebsocket extends WebsocketClient {
  on(event: "message", eventHandler: GdaxMessageEventHandler): void
  on(event: "error", eventHandler: (err: any) => void): void
  on(event: "open" | "close", eventHandler: () => void): void
}

const startProducer = (options: GdaxOptions) => {
  const producer: ProducerEmitter = new EventEmitter()

  const client = new WebsocketClient(options.pairs, undefined, undefined, {
    channels: options.channels
  }) as GdaxWebsocket

  client.on("open", () => producer.emit("connect"))
  client.on("error", (err) => producer.emit("error", err))
  client.on("close", () => producer.emit("disconnect"))

  client.on("message", (data) => {
    switch (data.type) {
      case "ticker":
        const priceData: PriceData = {
          bestAsk: data.best_ask,
          bestBid: data.best_bid,
          pair: data.product_id,
          price: data.price,
          side: data.side,
          type: data.type,
          volume: data.last_size
        }
        producer.emit("message", priceData)
    }
  })

  return producer as Producer
}

export const createProducer = (options: GdaxOptions) => ({
  start: () => startProducer(options)
})
