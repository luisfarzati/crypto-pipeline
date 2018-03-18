import * as envalid from "envalid";

const ansiTitleHead = `${String.fromCharCode(27)}]0;`;
const ansiTitleTail = String.fromCharCode(7);

const useTerminalTitle = (...title: string[]) => {
  if (process.stdout.isTTY) {
    process.stdout.write(`${ansiTitleHead}${title.join(".")}${ansiTitleTail}`);
  }
};

const envalidJsonArray = envalid.makeValidator<string[]>((input: string | string[]) => {
  const pairs = typeof input === "string" ? JSON.parse(input) : input;
  if (Array.isArray(pairs)) {
    return pairs;
  } else {
    throw new Error();
  }
});

export { envalidJsonArray, useTerminalTitle };
