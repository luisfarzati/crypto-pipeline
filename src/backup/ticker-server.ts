// import * as Redis from "ioredis";
// import * as WebSocket from "ws";
// import { cleanEnv } from "envalid";

// const isoNow = () => new Date().toISOString();
// const writeOut = (m: string) => process.stdout.write(`${isoNow()} ${m}\n`);

// const env = parseEnv();

// writeOut(`Starting ticker processor`);

// const redis = new Redis({
//   host: env.REDIS_HOST,
//   port: env.REDIS_PORT
// });

// const wss = new WebSocket.Server({
//   port: env.TICKER_WS_PORT
// });

// const broadcast = (data: any) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

// async function main() {
//   const pairs = env.CURRENCY_PAIRS as string[];
//   const r = (await redis.mget(...pairs.map((p) => `l.${p}`))) as string[];
//   const tickers = r.map((json) => JSON.parse(json));
//   broadcast(JSON.stringify(tickers));
//   setTimeout(main, 1000);
// }

// try {
//   main();
// } catch (err) {
//   console.log(err);
// }
