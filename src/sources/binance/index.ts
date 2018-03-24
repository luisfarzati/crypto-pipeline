import * as envalid from "envalid";
import * as WebSocket from "uws";
import { envalidJsonArray } from "../../utils";
import { createLogger } from "../../services/logger";

const DEFAULT_WS_URL = "wss://stream.binance.com:9443/ws/!ticker@arr";
const DEFAULT_SOURCE_NAME = "binance";

const configurationVars = {
  SOURCE_NAME: envalid.str({
    default: DEFAULT_SOURCE_NAME
  }),
  WS_URL: envalid.url({
    default: DEFAULT_WS_URL,
    example: DEFAULT_WS_URL
  })
};

/**
 * Connect to the Binance WebSocket API.
 * @param handler callback to invoke for every received message
 * @param environment
 * @param isRetry
 */
const connect: SourceConnectFunction = (handler, environment = process.env, isRetry = false) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  const logger = createLogger(`${env.SOURCE_NAME}.socket`);

  if (!isRetry) {
    logger.info(`connecting to Binance`);
    logger.info(`will subscribe to channel !ticker@arr for all pairs`);
  }

  const ws = new WebSocket(env.WS_URL);

  // TODO: remove hardcoding
  const CHANNEL_PAIR_REGEX = /BTC|USDT?$/;

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
    logger.error(`${err.message} -- Reason: ${err.reason || "unknown"}`);
  });
  ws.on("message", (message: string) => {
    const events = JSON.parse(message) as BinanceTickerMessage[];

    // TODO: remove hardcoding
    events.filter((event) => event.s.match(CHANNEL_PAIR_REGEX)).forEach(handler);
  });
};

export { connect };
