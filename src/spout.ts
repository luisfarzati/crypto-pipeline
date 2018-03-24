import * as path from "path";
import * as envalid from "envalid";
import { createRedis } from "./services/redis";
import { createLogger } from "./services/logger";
import { useTerminalTitle } from "./utils";

const DEFAULT_REDIS_KEY_PREFIX = "";
const DEFAULT_REDIS_BUFFER_KEY = "buffer";
const DEFAULT_REDIS_PUB_CHANNEL_PREFIX = "feed";

const configurationVars = {
  DEBUG: envalid.bool({
    devDefault: true
  }),
  SOURCE_NAME: envalid.str({
    example: "gdax"
  }),
  MAPPER_NAME: envalid.str({
    example: "event"
  }),
  REDIS_KEY_PREFIX: envalid.str({
    default: DEFAULT_REDIS_KEY_PREFIX,
    desc: "Same as SOURCE_NAME if specified"
  }),
  REDIS_BUFFER_KEY: envalid.str({
    default: DEFAULT_REDIS_BUFFER_KEY
  }),
  REDIS_PUB_CHANNEL_PREFIX: envalid.str({
    default: DEFAULT_REDIS_PUB_CHANNEL_PREFIX
  })
};

/**
 * Starts a spout that takes events from the given buffer and pushes events into the stream channel.
 * @param environment
 */
const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);
  useTerminalTitle(env.SOURCE_NAME.toUpperCase(), "spout");

  // Scopes down Redis usage to keys prefixed with the source name
  const redisKeyPrefix = env.REDIS_KEY_PREFIX || env.SOURCE_NAME;

  const logger = createLogger(`${env.SOURCE_NAME}.spout`);
  logger.info(`starting ${env.SOURCE_NAME} emitter`);
  logger.info(`fetching raw data from Redis queue: "${redisKeyPrefix}.${env.REDIS_BUFFER_KEY}"`);
  logger.info(`pushing events into Redis channel: "${env.REDIS_PUB_CHANNEL_PREFIX}.${redisKeyPrefix}"`);

  const redis = createRedis({
    ...process.env,
    ...env,
    REDIS_KEY_PREFIX: redisKeyPrefix
  });

  // Import the specified source implementation
  const mapperPath = path.resolve(__dirname, "sources", env.SOURCE_NAME, "mappers", env.MAPPER_NAME);
  const mapper = (await import(mapperPath)) as SpoutMapper;

  while (true) {
    const [, eventJson]: string = await redis.brpop(env.REDIS_BUFFER_KEY, "0");
    const event = mapper.map(eventJson);

    if (!event) {
      continue;
    } else if (env.DEBUG) {
      logger.info(eventJson);
    }

    const events = Array.isArray(event) ? event : [event];

    events.forEach((eventItem) => {
      redis.publish(
        `${env.REDIS_PUB_CHANNEL_PREFIX}.${eventItem.$source}.${eventItem.$pair}`,
        JSON.stringify(eventItem)
      );
    });
  }
};

if (module.parent == null) {
  start();
}

export { start };
