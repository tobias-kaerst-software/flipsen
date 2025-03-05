import type { AxiosError } from 'axios';
import type { SafeParseReturnType } from 'zod';

import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { config, env } from '$/config';
import { logger } from '$/utils/logger';

export const supportedTranslations = config.tmdbSupportedTranslations;

export const tmdbDefaultParams = {
  language: config.tmdbDefaultLang,
  include_image_language: config.tmdbSupportedLanguages.join(',') + ',null',
  include_video_language: config.tmdbSupportedLanguages.join(',') + ',null',
};

const clients = config.tmdbProxyUrls.map((url) =>
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
  parser: (data: unknown) => SafeParseReturnType<I, O> = (d) => ({ success: true, data: d as O }),
) => {
  const client = clients[requestCounter++ % clients.length];

  const res = await client
    .get(url, { params: { ...tmdbDefaultParams, ...params } })
    .catch((e: AxiosError) => {
      logger.error(e.message, {
        type: 'axios_error',
        req: { url, params },
        res: { data: e.response?.data, headers: e.response?.headers, status: e.response?.status },
      });

      return e.status ?? 500;
    });

  if (typeof res === 'number') {
    return { err: 'could_not_fetch' as const, status: res, data: undefined };
  }

  const data = parser(res?.data);

  if (!data.success) {
    logger.error(data.error.message, {
      type: 'zod_error',
      req: { url, params },
      error: data.error,
    });

    return { err: 'could_not_parse' as const, status: 500, data: undefined };
  }

  return { data: data.data, err: undefined, status: 200 };
};
