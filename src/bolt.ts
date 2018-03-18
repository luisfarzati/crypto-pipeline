import * as path from "path";
import * as envalid from "envalid";
import { createRedis } from "./services/redis";
import { createLogger } from "./services/logger";
import { useTerminalTitle } from "./utils";

const configurationVars = {
  DEBUG: envalid.bool({
    devDefault: true
  }),
  BOLT_NAME: envalid.str({
    example: "websocket"
  }),
  REDIS_CHANNEL: envalid.str({
    example: "feed.*"
  })
};

/**
 * Creates an instance of a bolt and connects it to the given stream (Redis channel).
 * @param environment
 */
const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);
  useTerminalTitle(env.BOLT_NAME, "bolt");

  const logger = createLogger(`${env.BOLT_NAME}`);
  logger.info(`starting bolt ${env.BOLT_NAME}`);
  logger.info(`subscribing to channel: "${env.REDIS_CHANNEL}"`);

  const redis = createRedis({
    ...process.env,
    ...env
  });

  // Import the specified bolt implementation
  const boltPath = path.resolve(__dirname, "bolts", env.BOLT_NAME);
  const bolt = (await import(boltPath)) as Bolt;

  redis.psubscribe(env.REDIS_CHANNEL);
  redis.on("pmessage", bolt.execute);
};

if (module.parent == null) {
  start();
}

export { start };
