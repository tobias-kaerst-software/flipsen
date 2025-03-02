import type { AxiosError } from 'axios';
import type { SafeParseReturnType } from 'zod';

import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { env } from '$/config';
import { logger } from '$/utils/logger';

export const supportedTranslations = ['de'];

export const tmdbDefaultParams = {
  language: 'en-US',
  include_image_language: 'de,en,null',
  include_video_language: 'de,en,null',
};

const proxyUrls = ['https://api.themoviedb.org/3'];

const clients = proxyUrls.map((url) =>
  rateLimit(
    axios.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }),
    { maxRequests: 40, perMilliseconds: 1000 },
  ),
);

let requestCounter = 0;

export const tmdb = async <I, O>(
  url: string,
  params: Record<string, string>,
  parser: (data: unknown) => SafeParseReturnType<I, O>,
  skipFetchErrorLogging = false,
) => {
  const client = clients[requestCounter++ % clients.length];

  const res = await client
    .get(url, { params: { ...tmdbDefaultParams, ...params } })
    .catch((e: AxiosError) => {
      logger.error('could_not_fetch', e, { url }, skipFetchErrorLogging);
      return e.status ?? 500;
    });

  if (typeof res === 'number') {
    return { err: 'could_not_fetch' as const, status: res, data: undefined };
  }

  const data = parser(res?.data);

  if (!data.success) {
    logger.error('could_not_parse', data.error, { url });
    return { err: 'could_not_parse' as const, status: 500, data: undefined };
  }

  return { data: data.data, err: undefined, status: 200 };
};
