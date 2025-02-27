import { z } from 'zod';

export const TmdbAlternativeTitlesSchema = z
  .array(z.object({ iso_3166_1: z.string(), title: z.string() }))
  .transform((data) => data.map((title) => ({ country: title.iso_3166_1, title: title.title })));
