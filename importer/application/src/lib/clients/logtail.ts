import { Logtail } from '@logtail/node';

import { config, env } from '$/config';

export const logtail = new Logtail(env.LOGTAIL_TOKEN, {
  endpoint: env.LOGTAIL_ENDPOINT,
});

let flushTimeout: null | Timer = null;

export const logtailDebouncedFlush = () => {
  if (flushTimeout) clearTimeout(flushTimeout);

  flushTimeout = setTimeout(() => {
    logtail.flush();
    flushTimeout = null;
  }, config.logtailFlushDebounceTime);

  return undefined;
};
