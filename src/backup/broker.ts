// import * as cluster from "cluster"
// import * as envalid from "envalid"
// import * as path from "path"
// import { createLogger } from "./services/logger"
// import { createRedis } from "./services/redis"

// const envalidJsonArray = envalid.makeValidator<string[]>((input: string | string[]) => {
//   if (Array.isArray(input)) {
//     return input
//   }

//   const pairs = JSON.parse(input)
//   if (Array.isArray(pairs)) {
//     return pairs
//   }

//   throw new Error("Not a valid JSON array")
// })

// async function runMaster() {
//   const configurationVars = {
//     BUFFER_KEYS: envalidJsonArray({ default: [] }),
//     REDIS_BUFFER_KEY_PREFIX: envalid.str({ default: "buffer" })
//   }

//   const env = envalid.cleanEnv(process.env, configurationVars)
//   const logger = createLogger("broker")
//   const redis = createRedis()

//   logger.info(`starting master broker`)
//   logger.info("fetching buffer keys")

//   const bufferKeys = env.BUFFER_KEYS.length
//     ? env.BUFFER_KEYS
//     : await redis.keys(`${env.REDIS_BUFFER_KEY_PREFIX}.*`)

//   for (const fullKey of bufferKeys) {
//     const sourceKey = fullKey.split(".").pop()
//     logger.info(`forking ${sourceKey} broker`)
//     cluster
//       .fork({
//         ...process.env,
//         ...env,
//         REDIS_BUFFER_KEY: sourceKey
//       })
//       .on("exit", () => logger.info("broker quit"))
//   }
// }

// async function runWorker() {
//   const configurationVars = {
//     REDIS_BUFFER_KEY: envalid.str(),
//     REDIS_BUFFER_KEY_PREFIX: envalid.str({ default: "buffer" })
//   }

//   const env = envalid.cleanEnv(process.env, configurationVars)
//   const logger = createLogger(env.REDIS_BUFFER_KEY)

//   const clientPath = path.resolve(__dirname, "clients", env.REDIS_BUFFER_KEY)
//   const mapper = (await import(clientPath)) as SourceMapper

//   logger.info(`starting ${env.REDIS_BUFFER_KEY} broker`)

//   const key = `${env.REDIS_BUFFER_KEY_PREFIX}.${env.REDIS_BUFFER_KEY}`

//   const redis = createRedis()
//   const loop = async () => {
//     // while (true) {
//     logger.info("about to fetch", env.REDIS_BUFFER_KEY, "events")
//     const [, eventJson] = await redis.brpop(key, "0")

//     const event = JSON.parse(eventJson)

//     // }
//   }

//   loop().catch((err) => logger.error(err))
// }

// if (cluster.isMaster) {
//   runMaster()
// } else {
//   runWorker()
// }
