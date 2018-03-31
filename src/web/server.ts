import * as envalid from "envalid";
import * as express from "express";
import * as WebSocket from "uws";
import { createLogger } from "../services/logger";
import { createRedis } from "../services/redis";
import { useTerminalTitle } from "../utils";

const configurationVars = {
  HOST: envalid.host({ default: "0.0.0.0" }),
  PORT: envalid.port({ default: 7980 })
};

const start = async (environment = process.env) => {
  const env = envalid.cleanEnv(environment, configurationVars);
  useTerminalTitle("web-client");

  const logger = createLogger(`web-client`);

  const wss = new WebSocket.Server({
    clientTracking: true,
    host: env.HOST,
    port: env.PORT + 1
  });
  wss.on("connection", (s) => {
    logger.info("WebSocket client connected");
    s.on("close", () => logger.info("WebSocket client disconnected"));
  });
  wss.on("error", (err) => {
    logger.error(err.name, err.message);
  });

  const redis = createRedis();
  redis.psubscribe("feed.1s.*");
  redis.on("pmessage", (_pattern, channel, message) => {
    const deserializedMessage = JSON.parse(message);
    const m = JSON.stringify({
      feed: channel,
      message: deserializedMessage
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        logger.info(`pushing ${channel} event to client`);
        client.send(m);
      }
    });
  });

  const app = express();
  app.use((req, _res, next) => {
    if (!req.url.includes(".")) {
      logger.info(req.url);
    }
    next();
  });
  app.use(express.static("public"));
  app.listen(env.PORT, env.HOST, () => {
    logger.info(`Starting web client at ${env.HOST}:${env.PORT}`);
  });
};

if (module.parent == null) {
  start();
}

export { start };
