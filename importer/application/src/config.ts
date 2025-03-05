import { z } from 'zod';

export const env = z
  .object({
    OPENAPI_API_KEY: z.string(),
    TMDB_API_KEY: z.string(),
    LOGTAIL_TOKEN: z.string(),
    LOGTAIL_ENDPOINT: z.string(),
  })
  .parse(process.env);

export const config = {
  tmdbDefaultLang: 'en-US',
  tmdbSupportedLanguages: ['de', 'en'],
  tmdbSupportedTranslations: ['de'],
  tmdbProxyUrls: ['https://api.themoviedb.org/3'],
  logtailFlushDebounceTime: 1000,
  shouldLogToLogtail: false,
};
