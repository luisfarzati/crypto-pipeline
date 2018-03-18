import * as envalid from "envalid";
import * as Redis from "ioredis";
import { createLogger } from "../services/logger";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 6379;
const DEFAULT_KEY_PREFIX = "";

const configurationVars = {
  REDIS_HOST: envalid.host({
    default: DEFAULT_HOST
  }),
  REDIS_PORT: envalid.port({
    default: DEFAULT_PORT
  }),
  REDIS_UNIX_SOCKET: envalid.str({
    default: "",
    example: "/tmp/redis.sock"
  }),
  REDIS_KEY_PREFIX: envalid.str({
    default: DEFAULT_KEY_PREFIX
  })
};

function prependIf(s: string, ...args: string[]) {
  return s ? args.join("").concat(s) : "";
}

function concatIf(s: string, ...args: string[]) {
  return s ? s.concat(args.join("")) : "";
}

function createRedis(environment: any = process.env) {
  const logger = createLogger("redis");
  const env = envalid.cleanEnv(environment, configurationVars);

  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    path: env.REDIS_UNIX_SOCKET,
    lazyConnect: false,
    showFriendlyErrorStack: env.isDevelopment,
    keyPrefix: concatIf(env.REDIS_KEY_PREFIX, ".")
  });
  client.on("connect", () => {
    logger.info("connected;", prependIf(env.REDIS_KEY_PREFIX, "using prefix: "));
  });
  client.on("close", () => {
    logger.info("disconnected");
  });

  return client;
}

export { createRedis };
