import * as path from "path";
import * as envalid from "envalid";
import { createRedis } from "./services/redis";
import { createLogger } from "./services/logger";
import { useTerminalTitle } from "./utils";

// TODO: handle timeout/disconnections/retries
// TODO: logging/alerts for too many retries

const DEFAULT_REDIS_KEY_PREFIX = "";
const DEFAULT_REDIS_BUFFER_KEY = "buffer";

const configurationVars = {
  DEBUG: envalid.bool({
    devDefault: true
  }),
  SOURCE_NAME: envalid.str({
    example: "gdax"
  }),
  REDIS_KEY_PREFIX: envalid.str({
    default: DEFAULT_REDIS_KEY_PREFIX,
    desc: "Same as SOURCE_NAME if specified"
  }),
  REDIS_BUFFER_KEY: envalid.str({
    default: DEFAULT_REDIS_BUFFER_KEY
  })
};

/**
 * Annotates the raw message object with fields such as source name and ingestion timestamp.
 * @param message
 * @param source
 */
const annotated = (message: any, source: SourceName) => {
  const annotations: BufferMessage = {
    $source: source,
    $its: Date.now()
  };
  const messageObject = typeof message === "string" ? JSON.parse(message) : message;
  return {
    ...messageObject,
    ...annotations
  };
};

/**
 * Connects to the source feed and appends all events to the given buffer.
 * @param environment
 */
const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);
  useTerminalTitle(env.SOURCE_NAME.toUpperCase(), "client");

  // Scopes down Redis usage to keys prefixed with the source name
  const redisKeyPrefix = env.REDIS_KEY_PREFIX || env.SOURCE_NAME;

  const logger = createLogger(`${env.SOURCE_NAME}.client`);
  logger.info(`starting ${env.SOURCE_NAME} client`);
  logger.info(`pushing raw data into Redis queue: "${redisKeyPrefix}.${env.REDIS_BUFFER_KEY}"`);

  const redis = createRedis({
    ...process.env,
    ...env,
    REDIS_KEY_PREFIX: redisKeyPrefix
  });

  // Import the specified source implementation
  const sourceClientPath = path.resolve(__dirname, "sources", env.SOURCE_NAME);
  const source = (await import(sourceClientPath)) as SourceClient;

  source.connect((message) => {
    const eventJson = JSON.stringify(annotated(message, env.SOURCE_NAME as any));
    redis.lpush(env.REDIS_BUFFER_KEY, eventJson);
  });
};

if (module.parent == null) {
  start();
}

export { start };
