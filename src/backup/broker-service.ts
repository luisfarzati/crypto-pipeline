// import * as envalid from "envalid"
// import { createLogger } from "./services/logger"
// import { createRedis } from "./services/redis"

// const configurationVars = {}

// interface Subscription {
//   name: string
//   channels: string[]
// }

// async function main() {
//   const env = envalid.cleanEnv(process.env, configurationVars)
//   const logger = createLogger("broker-sub")
//   const redis = createRedis()

//   logger.info(`starting broker subscription server`)

//   while (true) {
//     const [, subscriptionJson] = await redis.brpop("register", "0")
//     const subscription = JSON.parse(subscriptionJson) as Subscription

//     redis.hset("consumers", subscription.name)
//   }
// }

// main()
