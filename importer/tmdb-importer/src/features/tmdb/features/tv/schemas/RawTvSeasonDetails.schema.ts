import { z } from 'zod';

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
    freebase_mid: z.string().nullable(),
    freebase_id: z.string().nullable(),
    tvdb_id: z.number().nullable(),
    tvrage_id: z.number().nullable(),
    wikidata_id: z.string().nullable(),
  }),

  credits: z.object({
    cast: z.array(z.object({ credit_id: z.string() })),
    crew: z.array(z.object({ credit_id: z.string() })),
  }),

  videos: z.object({ results: TmdbVideosSchema }),

  episodes: z.array(z.object({ episode_number: z.number() })),
});
