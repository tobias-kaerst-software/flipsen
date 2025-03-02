import { z } from 'zod';

import { TmdbBasicPersonSchema } from '$/features/tmdb/schemas/TmdbBasicPerson.schema';
import { TmdbImagesSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbVideosSchema } from '$/features/tmdb/schemas/TmdbVideo.schema';

export const RawTvSeasonDetailsSchema = z.object({
  id: z.number(),
  season_number: z.number(),

  name: z.string(),
  overview: z.string(),
  air_date: z.string().nullable(),
  vote_average: z.number(),

  images: TmdbImagesSchema,

  translations: z
    .object({
      translations: z.array(
        z.object({
          iso_639_1: z.string(),
          data: z.object({
            overview: z.string().nullable().default(''),
            name: z.string().nullable().default(''),
          }),
        }),
      ),
    })
    .optional()
    .default({ translations: [] }),

  external_ids: z
    .object({
      freebase_mid: z.string().nullable(),
      freebase_id: z.string().nullable(),
      tvdb_id: z.number().nullable(),
      tvrage_id: z.number().nullable(),
      wikidata_id: z.string().nullable(),
    })
    .optional()
    .default({ freebase_mid: null, freebase_id: null, tvdb_id: null, tvrage_id: null, wikidata_id: null }),

  credits: z
    .object({
      cast: z.array(z.object({ credit_id: z.string() })),
      crew: z.array(z.object({ credit_id: z.string() })),
    })
    .optional()
    .default({ cast: [], crew: [] }),

  videos: z.object({ results: TmdbVideosSchema }).optional().default({ results: [] }),

  episodes: z.array(
    z.object({
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

      cast: z
        .array(z.object({ credit_id: z.string() }))
        .optional()
        .default([]),
      crew: z
        .array(z.object({ credit_id: z.string() }))
        .optional()
        .default([]),
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
  ),
});
