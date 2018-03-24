import * as envalid from "envalid";
import * as WebSocket from "uws";
import { envalidJsonArray } from "../../utils";
import { createLogger } from "../../services/logger";

const DEFAULT_WS_URL = "wss://real.okex.com:10441/websocket";
const DEFAULT_SOURCE_NAME = "okex";

const configurationVars = {
  SOURCE_NAME: envalid.str({
    default: DEFAULT_SOURCE_NAME
  }),
  PAIRS: envalidJsonArray({
    example: '["btc_usdt", "eth_btc"]'
  }),
  WS_URL: envalid.url({
    default: DEFAULT_WS_URL,
    example: DEFAULT_WS_URL
  })
};

/**
 * Connect to the OKEX WebSocket API.
 * @param handler callback to invoke for every received message
 * @param environment
 * @param isRetry
 */
const connect: SourceConnectFunction = (handler, environment = process.env, isRetry = false) => {
  const env = envalid.cleanEnv(environment, configurationVars);

  const logger = createLogger(`${env.SOURCE_NAME}.socket`);

  if (!isRetry) {
    logger.info(`connecting to OKEX`);
    logger.info(`will subscribe to channels ok_sub_spot_ticker for pairs: ${env.PAIRS}`);
  }

  const ws = new WebSocket(env.WS_URL);

  const connectionInitTime = Date.now();
  ws.on("open", () => {
    const connectionDelay = Date.now() - connectionInitTime;
    logger.info(`connected in ${connectionDelay}ms`);
    for (const pair of env.PAIRS) {
      ws.send(`{'event':'addChannel','channel':'ok_sub_spot_${pair}_ticker'}`);
    }
  });
  ws.on("close", () => {
    setImmediate(() => connect(handler, environment, true));
    logger.info("disconnected");
  });
  ws.on("error", (err: any) => {
    logger.error(`${err.message} -- Reason: ${err.reason || "unknown"}`);
  });
  ws.on("message", (serialized) => {
    // OKEX messages come inside an single-element array for some reason
    const [message] = JSON.parse(serialized);
    handler(message);
  });
};

export { connect };
