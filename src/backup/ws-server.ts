// import * as WebSocket from "uws";
// import * as envalid from "envalid";
// import { createRedis } from "./services/redis";
// import { createLogger } from "./services/logger";

// const configurationVars = {
//   HOST: envalid.host({ default: "0.0.0.0" }),
//   PORT: envalid.port({ default: 3679 })
// };

// const start = async (environment = process.env) => {
//   const env = envalid.cleanEnv(environment, configurationVars);

//   process.stdout.write(`${String.fromCharCode(27)}]0;ws-server${String.fromCharCode(7)}`);

//   const logger = createLogger(`ws-server`);

//   const wss = new WebSocket.Server({
//     clientTracking: true,
//     host: env.HOST,
//     port: env.PORT
//   });
//   wss.on("connection", () => logger.info("client connected"));

//   const redis = createRedis();
//   redis.psubscribe("feed.*");
//   redis.on("pmessage", (pattern, channel, message) => {
//     const m = JSON.stringify({
//       source: channel.startsWith("feed.gdax") ? "gdax" : "okex",
//       feed: channel,
//       data: JSON.parse(message)
//     });
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(m);
//       }
//     });
//   });
// };

// if (module.parent == null) {
//   start();
// }

// export { start };
