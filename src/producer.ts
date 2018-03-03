import { EventEmitter } from "events"

export interface ProducerMessage {
  type: string
}

export interface PriceData extends ProducerMessage {
  pair: string
  price: string
  side: "buy" | "sell"
  volume: string
  bestBid: string
  bestAsk: string
}

type PriceMessageEventHandler = (data: PriceData) => void

export interface Producer {
  on(event: "connect" | "disconnect", handler: () => void): this
  on(event: "price", handler: PriceMessageEventHandler): this
  on(event: "error", handler: (err: any) => void): this
  on(event: "message", handler: (data: any) => void): this
}

export interface ProducerEmitter extends EventEmitter {
  emit(event: "connect" | "disconnect"): boolean
  emit(event: "error", err: any): boolean
  emit(event: "price", data: PriceData): boolean
  emit(event: "message", data: any): boolean // tslint:disable-line
}
