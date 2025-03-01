import { z } from 'zod';

import { TmdbBasicPersonSchema } from '$/features/tmdb/general/schemas/TmdbBasicPerson.schema';
import { TmdbImagesSchema } from '$/features/tmdb/general/schemas/TmdbImage.schema';

export const RawTvEpisodeDetailsSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  episode_number: z.number(),

  name: z.string(),
  overview: z.string(),
  air_date: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  production_code: z.string(),
  runtime: z.number().nullable(),

  images: TmdbImagesSchema,

  translations: z.object({
    translations: z.array(
      z.object({
        iso_639_1: z.string(),
        data: z.object({
          overview: z.string(),
          name: z.string(),
        }),
      }),
    ),
  }),

  external_ids: z.object({
    imdb_id: z.string().nullable(),
    freebase_mid: z.string().nullable(),
    freebase_id: z.string().nullable(),
    tvdb_id: z.number().nullable(),
    tvrage_id: z.number().nullable(),
    wikidata_id: z.string().nullable(),
  }),

  credits: z.object({
    cast: z.array(z.object({ credit_id: z.string() })),
    crew: z.array(z.object({ credit_id: z.string() })),
    guest_stars: z
      .array(
        z
          .object({
            credit_id: z.string(),
            character: z.string(),
            order: z.number(),
          })
          .and(TmdbBasicPersonSchema),
      )
      .optional(),
  }),
});
