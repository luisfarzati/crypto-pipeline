import { Big } from "big.js";

export const avg = (count = 0, total = new Big(0), n: string) => total.plus(n).div(count + 1);

export const max = (highest = new Big(0), n: string) => {
  const num = new Big(n);
  return highest.lt(num) ? num : highest;
};

export const min = (lowest: Big | undefined, n: string) => {
  const num = new Big(n);
  if (lowest === undefined) {
    return num;
  }
  return num.lt(lowest) ? num : lowest;
};

export const toSecond = (t: number) => Math.floor(t / 1000) * 1000;
export const toMinute = (t: number) => Math.floor(t / 1000 / 60) * 1000 * 60;
