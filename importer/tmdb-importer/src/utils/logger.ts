import { red } from 'picocolors';

interface Writer {
  write: (message: string) => void;
}

const consoleWriter: Writer = {
  write(message: string) {
    console.log(message);
  },
};

export const logger = {
  error: (msg: string, error: object, payload?: object) => {
    consoleWriter.write(red(`ERROR: ${msg}`) + '\n' + JSON.stringify({ error, payload }, null, 2));
    Bun.write(`errors/${Date.now()}.log`, JSON.stringify({ msg, error, payload }, null, 2));
    return undefined;
  },
};
