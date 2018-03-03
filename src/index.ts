import * as Redis from "ioredis"
import { parseEnv } from "./env"
import { createProducer } from "./gdax-producer"

const isoNow = () => new Date().toISOString()
const writeOut = (m: string) => process.stdout.write(`${isoNow()} ${m}\n`)

const DEFAULT_CHANNELS = ["ticker"]

const env = parseEnv()

writeOut(`Starting producer for currency pairs: ${env.CURRENCY_PAIRS}`)

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
})

const Producer = createProducer({
  channels: DEFAULT_CHANNELS,
  pairs: env.CURRENCY_PAIRS
})

function main() {
  const p = Producer.start()
  const connectionInitTime = Date.now()
  p.on("connect", () => {
    const connectionDelay = Date.now() - connectionInitTime
    writeOut(`Connected to server in ${connectionDelay}ms`)
  })
  p.on("disconnect", () => {
    setImmediate(main)
    writeOut("Disconnected from server")
  })
  p.on("error", (err) => {
    writeOut(`Error: ${err.message}`)
  })
  p.on("message", (data) => {
    const datapoint = JSON.stringify({ ...data, its: Date.now() })
    redis
      .pipeline()
      .set(`l.${data.pair}`, datapoint)
      .lpush(`q.${data.pair}`, datapoint)
      .exec()
  })
}

main()
