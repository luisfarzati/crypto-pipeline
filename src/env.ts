import * as envalid from "envalid"

const variables = {
  CURRENCY_PAIRS: envalid.json({
    example: "['BTC-USD', 'BTC-EUR']"
  }),
  REDIS_HOST: envalid.host({
    default: "localhost"
  }),
  REDIS_PORT: envalid.port({
    default: 6379
  }),
  TICKER_UI_PORT: envalid.port({
    default: 8091
  }),
  TICKER_WS_PORT: envalid.port({
    default: 9191
  })
}

const options: envalid.CleanOptions = {
  strict: true
}

export const parseEnv = (env: any = process.env) =>
  envalid.cleanEnv(env, variables, options)
