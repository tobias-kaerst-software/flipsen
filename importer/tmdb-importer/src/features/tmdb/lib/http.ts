import type { AxiosError } from 'axios';
import type { SafeParseReturnType } from 'zod';

import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { env } from '$/config';
import { logger } from '$/utils/logger';

export const tmdbDefaultParams = {
  language: 'de-DE',
  include_image_language: 'de,en,null',
  include_video_language: 'de,en,null',
};

const client1 = rateLimit(
  axios.create({
    baseURL: 'http://dev-linux-app.azurewebsites.net/3',
    headers: {
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }),
  { maxRequests: 40, perMilliseconds: 1000 },
);

const client2 = rateLimit(
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }),
  { maxRequests: 40, perMilliseconds: 1000 },
);

// client.interceptors.request.use(AxiosLogger.requestLogger);

let requestCounter = 0;

export const tmdb = async <I, O>(
  url: string,
  params: Record<string, string>,
  parser: (data: unknown) => SafeParseReturnType<I, O>,
) => {
  const client = requestCounter++ % 2 === 0 ? client1 : client2;

  const res = await client
    .get(url, { params: { ...tmdbDefaultParams, ...params } })
    .catch((e: AxiosError) => {
      logger.error('could_not_fetch', e, { url });
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
