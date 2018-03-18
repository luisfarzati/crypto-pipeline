import * as envalid from "envalid";
import { Writable } from "stream";

const configurationVars = {
  DEBUG: envalid.bool({ devDefault: true })
};

const log = (target: Writable, name: string, level: string, ...args: any[]) => {
  const t = new Date().toISOString();
  const l = level.padEnd(5);
  const n = name.padStart(12);
  target.write(`${t} ${l} ${n} ${args.join(" ")}\n`);
};

export function createLogger(name: string, rawEnv = process.env) {
  const noop = () => {}; // tslint:disable-line

  const env = envalid.cleanEnv(rawEnv, configurationVars);

  const debug = (...args: any[]) => log(process.stdout, name, "debug", ...args);
  const info = (...args: any[]) => log(process.stdout, name, "info", ...args);
  const error = (...args: any[]) => log(process.stderr, name, "error", ...args);

  return {
    debug: env.DEBUG ? debug : noop,
    error,
    info,
    name
  };
}
