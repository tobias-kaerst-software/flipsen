import { z } from 'zod';

export const TmdbAlternativeTitlesSchema = z
  .object({ results: z.array(z.object({ iso_3166_1: z.string(), title: z.string() })) })
  .transform((data) => data.results.map((title) => ({ country: title.iso_3166_1, title: title.title })));
