import { z } from 'zod';

export const env = z
  .object({
    OPENAPI_API_KEY: z.string(),
    TMDB_API_KEY: z.string(),
  })
  .parse(process.env);
