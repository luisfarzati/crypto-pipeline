import * as envalid from "envalid";
import { createRedis } from "../../services/redis";
import { createLogger } from "../../services/logger";

const configurationVars = {
  SOURCE_NAME: envalid.str({ default: "gdax" }),
  REDIS_KEY_PREFIX: envalid.str({ default: "", desc: "Same as SOURCE_NAME if specified" }),
  REDIS_LOG_KEY: envalid.str({ default: "log" }),
  TRIM_SIZE: envalid.num({ default: 10 * 60 * 10, desc: "Default is ~15 minutes of data" }),
  TRIM_PERIOD_MILLIS: envalid.num({ default: 1000 * 60 * 5, desc: "Default is 5 minutes" })
};

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);
  const REDIS_KEY_PREFIX = env.REDIS_KEY_PREFIX || env.SOURCE_NAME;

  process.stdout.write(
    `${String.fromCharCode(27)}]0;${env.SOURCE_NAME.toUpperCase()}-trimmer${String.fromCharCode(7)}`
  );

  const logger = createLogger(`${env.SOURCE_NAME}.trimmer`);
  logger.info(`starting trimmer ${env.SOURCE_NAME}`);
  logger.info(`will keep log "${REDIS_KEY_PREFIX}.${env.REDIS_LOG_KEY}" trimmed`);

  const redis = createRedis({ ...process.env, ...env, REDIS_KEY_PREFIX });

  setInterval(() => {
    logger.info(`trimming ${REDIS_KEY_PREFIX}.${env.REDIS_LOG_KEY} to ${env.TRIM_SIZE}`);
    redis.ltrim(env.REDIS_LOG_KEY, 0, env.TRIM_SIZE);
  }, env.TRIM_PERIOD_MILLIS);
};

if (module.parent == null) {
  start();
}

export { start };
