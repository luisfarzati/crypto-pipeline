import * as envalid from "envalid";
import { WebsocketClient } from "gdax";
import { envalidJsonArray } from "../../utils";
import { createLogger } from "../../services/logger";

const DEFAULT_SOURCE_NAME = "gdax";
const DEFAULT_CHANNELS = ["ticker"];

const configurationVars = {
  SOURCE_NAME: envalid.str({
    default: DEFAULT_SOURCE_NAME
  }),
  CHANNELS: envalidJsonArray({
    default: DEFAULT_CHANNELS,
    example: '["ticker"]'
  }),
  PAIRS: envalidJsonArray({
    example: '["BTC-USD", "ETH-BTC"]'
  })
};

/**
 * Connect to the GDAX WebSocket API.
 * @param handler callback to invoke for every received message
 * @param environment
 * @param isRetry
 */
const connect: SourceConnectFunction = (handler, environment = process.env, isRetry = false) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  const logger = createLogger(`${env.SOURCE_NAME}.socket`);

  if (!isRetry) {
    logger.info(`connecting to GDAX`);
    logger.info(`will subscribe to channels ${env.CHANNELS} for pairs: ${env.PAIRS}`);
  }

  const ws = new WebsocketClient(env.PAIRS, undefined, undefined, {
    channels: env.CHANNELS
  });

  const connectionInitTime = Date.now();
  ws.on("open", () => {
    const connectionDelay = Date.now() - connectionInitTime;
    logger.info(`connected in ${connectionDelay}ms`);
  });
  ws.on("close", () => {
    setImmediate(() => connect(handler, environment, true));
    logger.info("disconnected");
  });
  ws.on("error", (err: any) => {
    logger.error(`${err.message} -- Reason: ${err.reason || ""}`);
  });
  ws.on("message", handler);
};

export { connect };
