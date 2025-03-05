import { logtail, logtailDebouncedFlush } from '$/lib/clients/logtail';

export const logger = {
  error: (msg: string, payload?: object) => {
    logtail.error(msg, payload);
    return logtailDebouncedFlush();
  },
  info: (msg: string, payload?: object) => {
    logtail.info(msg, payload);
    return logtailDebouncedFlush();
  },
  debug: (msg: string, payload?: object) => {
    logtail.debug(msg, payload);
    return logtailDebouncedFlush();
  },
};
