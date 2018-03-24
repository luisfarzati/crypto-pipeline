import { createRedis } from "./services/redis";

const redis = createRedis();

const fetchMinuteSeconds = (min: number) =>
  new Promise<any[]>((resolve, reject) => {
    const pattern = { match: "gdax.BTC-USD.1s.*" };
    const datapoints: string[] = [];
    const minute = new Date(min).getMinutes();
    const max = new Date(new Date(min).setMinutes(minute + 1)).getTime() - 1;

    redis
      .scanStream(pattern)
      .on("data", (keys) => {
        for (const k of keys) {
          const [, , , second] = k.split(".");
          const s = parseInt(second, 10);
          if (s >= min && s <= max) {
            datapoints.push(second);
          }
        }
      })
      .on("end", async () => {
        const keys = datapoints.map((ts) => `gdax.BTC-USD.1s.${ts}`);
        const data = (await redis.mget(...keys)) as string[];
        resolve(data.map((json) => JSON.parse(json)));
      })
      .on("error", (err) => {
        reject(err);
      });
  });

const fetchMinutes = (pair: string, min: number, max: number) =>
  new Promise<any[]>((resolve, reject) => {
    const pattern = { match: `gdax.${pair}.1m.*` };
    const datapoints: string[] = [];

    redis
      .scanStream(pattern)
      .on("data", (keys) => {
        for (const k of keys) {
          const [, , , second] = k.split(".");
          const s = parseInt(second, 10);
          if (s >= min && s <= max) {
            datapoints.push(second);
          }
        }
      })
      .on("end", async () => {
        if (datapoints.length === 0) {
          return resolve([]);
        }
        const keys = datapoints.map((ts) => `gdax.${pair}.1m.${ts}`);
        const data = (await redis.mget(...keys)) as string[];
        resolve(data.map((json) => JSON.parse(json)));
      })
      .on("error", (err) => {
        reject(err);
      });
  });

const colors = ["yellow", "cyan", "white"];
const blessed = require("blessed");
const contrib = require("blessed-contrib");

const chart = (...series: any[]) => {
  const screen = blessed.screen();

  series.forEach((data, i) => {
    console.log(data);
    const line = contrib.line({
      style: {
        line: colors[i],
        text: "green",
        baseline: "black"
      },
      xLabelPadding: 3,
      xPadding: 5,
      label: `C${i}`
    });
    screen.append(line);
    line.setData([data]);
  });
  screen.render();
};

const main = async () => {
  // const minute = new Date(new Date("2018-03-17T21:32:00.000Z").setSeconds(0));
  // const minute = new Date(1521324480000);
  // const min = minute.getTime();
  // const max = new Date(new Date(minute).setMinutes(minute.getMinutes() + 1)).getTime() - 1;
  // const data = await fetchMinuteSeconds(min);
  // const minuteData = JSON.parse(await redis.get(`gdax.BTC-USD.1m.${min}`));

  const min = new Date().getTime() - 1000 * 60 * 60;
  const max = Date.now();

  const btcusdData = await fetchMinutes("BTC-USD", min, max);
  const btcusdSorted = btcusdData.sort((a, b) => (a.time > b.time ? 1 : -1));

  const ethbtcData = await fetchMinutes("ETH-BTC", min, max);
  const ethbtcSorted = ethbtcData.sort((a, b) => (a.time > b.time ? 1 : -1));

  chart(
    {
      x: btcusdSorted.map((d, i) => new Date(d.time).toLocaleTimeString()),
      y: btcusdSorted.map((d) => parseInt(d.average_best_ask, 10))
    },
    {
      x: ethbtcSorted.map((d, i) => new Date(d.time).toLocaleTimeString()),
      y: ethbtcSorted.map((d) => parseFloat(d.average_best_ask) * 100000)
    }
  );
};

setImmediate(main);
setInterval(main, 10000);

// return datapoints.sort().map((ts) => [ts, new Date(ts).toLocaleTimeString()]);

// const key = await redis.keys(`gdax.1m.${min}`);

// console.log(key);
