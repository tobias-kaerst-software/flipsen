import { gray, green, red } from 'picocolors';

import { config } from '$/config';
import { logtail, logtailDebouncedFlush } from '$/lib/clients/logtail';

export const logger = {
  error: (msg: string, payload?: object) => {
    if (config.shouldLogToLogtail) {
      logtail.error(msg, payload);
      logtailDebouncedFlush();
    }

    console.log(red(`ERROR: ${msg}`) + (payload ? '\n' + JSON.stringify(payload, null, 2) : ''));

    return undefined;
  },
  info: (msg: string, payload?: object) => {
    if (config.shouldLogToLogtail) {
      logtail.info(msg, payload);
      logtailDebouncedFlush();
    }

    console.log(green(`INFO: ${msg}`) + (payload ? '\n' + JSON.stringify(payload, null, 2) : ''));

    return undefined;
  },
  debug: (msg: string, payload?: object) => {
    if (config.shouldLogToLogtail) {
      logtail.debug(msg, payload);
      logtailDebouncedFlush();
    }

    console.log(gray(`DEBUG: ${msg}`) + (payload ? '\n' + JSON.stringify(payload, null, 2) : ''));

    return undefined;
  },
};
