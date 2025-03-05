import { gray, green, red } from 'picocolors';

import { logtail, logtailDebouncedFlush } from '$/lib/clients/logtail';

export const logger = {
  error: (msg: string, payload?: object) => {
    logtail.error(msg, payload);
    console.log(red(`ERROR: ${msg}`) + '\n' + JSON.stringify(payload, null, 2));
    return logtailDebouncedFlush();
  },
  info: (msg: string, payload?: object) => {
    logtail.info(msg, payload);
    console.log(green(`INFO: ${msg}`) + '\n' + JSON.stringify(payload, null, 2));
    return logtailDebouncedFlush();
  },
  debug: (msg: string, payload?: object) => {
    logtail.debug(msg, payload);
    console.log(gray(`DEBUG: ${msg}`) + '\n' + JSON.stringify(payload, null, 2));
    return logtailDebouncedFlush();
  },
};
