// import * as envalid from "envalid";
// import * as express from "express";
// import * as path from "path";
// import { createLogger } from "./services/logger";

// const configurationVars = {
//   HOST: envalid.host({ default: "0.0.0.0" }),
//   PORT: envalid.port({ default: 3680 })
// };

// const start = async (environment = process.env) => {
//   const env = envalid.cleanEnv(environment, configurationVars);

//   process.stdout.write(`${String.fromCharCode(27)}]0;ws-client${String.fromCharCode(7)}`);

//   const logger = createLogger(`ws-client`);

//   const app = express();

//   app.use(express.static("public"));

//   app.listen(env.PORT, env.HOST, () => {
//     logger.info(`Starting ws-client at port ${env.PORT}`);
//   });
// };

// if (module.parent == null) {
//   start();
// }

// export { start };
