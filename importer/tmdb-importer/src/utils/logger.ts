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
  info: (msg: string, payload?: object) => {
    consoleWriter.write(`INFO: ${msg}` + (payload ? '\n' + JSON.stringify(payload, null, 2) : ''));
    return undefined;
  },
  debug: (msg: string, payload?: object) => {
    consoleWriter.write(`DEBUG: ${msg}` + (payload ? '\n' + JSON.stringify(payload, null, 2) : ''));
    return undefined;
  },
};
