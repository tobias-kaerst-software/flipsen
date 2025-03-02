import { z } from 'zod';

import { TmdbAlternativeTitlesSchema } from '$/features/tmdb/schemas/TmdbAlternativeTitles.schema';
import { TmdbBasicPersonSchema } from '$/features/tmdb/schemas/TmdbBasicPerson.schema';
import { TmdbImagesSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbProductionCompaniesSchema } from '$/features/tmdb/schemas/TmdbProductionCompanies.schema';

export const RawTvDetailsSchema = z.object({
  id: z.number(),

  name: z.string(),
  original_name: z.string(),
  overview: z.string(),
  tagline: z.string(),
  homepage: z.string(),

  first_air_date: z.string(),
  last_air_date: z.string().nullable(),
  status: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  type: z.string(),

  popularity: z.number(),
  original_language: z.string(),
  origin_country: z.array(z.string()),
  languages: z.array(z.string()),

  number_of_episodes: z.number().nullable(),
  number_of_seasons: z.number(),
  in_production: z.boolean(),

  genres: z.array(z.object({ name: z.string() })),
  keywords: z.object({ results: z.array(z.object({ name: z.string() })) }),

  spoken_languages: z.array(z.object({ iso_639_1: z.string() })),
  production_countries: z.array(z.object({ iso_3166_1: z.string() })),

  production_companies: TmdbProductionCompaniesSchema,
  alternative_titles: z.object({ results: TmdbAlternativeTitlesSchema }),
  images: TmdbImagesSchema,

  translations: z.object({
    translations: z.array(
      z.object({
        iso_639_1: z.string(),
        data: z.object({
          homepage: z.string().nullable().default(''),
          overview: z.string().nullable().default(''),
          tagline: z.string().nullable().default(''),
          name: z.string().nullable().default(''),
        }),
      }),
    ),
  }),

  external_ids: z.object({
    imdb_id: z.string().nullable(),
    freebase_mid: z.string().nullable(),
    freebase_id: z.string().nullable(),
    tvdb_id: z.number().nullable(),
    wikidata_id: z.string().nullable(),
    facebook_id: z.string().nullable(),
    instagram_id: z.string().nullable(),
    twitter_id: z.string().nullable(),
  }),

  networks: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),

  content_ratings: z.object({
    results: z.array(
      z.object({
        iso_3166_1: z.string(),
        rating: z.string(),
      }),
    ),
  }),

  aggregate_credits: z
    .object({
      cast: z.array(
        z
          .object({
            roles: z.array(
              z.object({ character: z.string(), episode_count: z.number(), credit_id: z.string() }),
            ),
            total_episode_count: z.number(),
            order: z.number(),
          })
          .and(TmdbBasicPersonSchema),
      ),
      crew: z.array(
        z
          .object({
            total_episode_count: z.number(),
            jobs: z.array(z.object({ job: z.string(), episode_count: z.number(), credit_id: z.string() })),
            department: z.string(),
          })
          .and(TmdbBasicPersonSchema),
      ),
    })
    .optional()
    .default({ cast: [], crew: [] }),

  seasons: z.array(z.object({ season_number: z.number(), episode_count: z.number() })),
});
