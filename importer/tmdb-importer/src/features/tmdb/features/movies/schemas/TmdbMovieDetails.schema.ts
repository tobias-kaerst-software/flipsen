import { z } from 'zod';

import { TmdbAlternativeTitlesSchema } from '$/features/tmdb/schemas/TmdbAlternativeTitles.schema';
import { TmdbBasicPersonSchema } from '$/features/tmdb/schemas/TmdbBasicPerson.schema';
import { TmdbImagesSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbProductionCompaniesSchema } from '$/features/tmdb/schemas/TmdbProductionCompanies.schema';
import { TmdbVideosSchema } from '$/features/tmdb/schemas/TmdbVideo.schema';

export const TmdbMovieDetailsSchema = z.object({
  id: z.number(),

  title: z.string(),
  original_title: z.string(),
  overview: z.string(),
  tagline: z.string(),
  homepage: z.string(),

  runtime: z.number(),
  release_date: z.string(),
  status: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),

  budget: z.number(),
  revenue: z.number(),
  popularity: z.number(),
  original_language: z.string(),
  origin_country: z.array(z.string()),

  genres: z.array(z.object({ name: z.string() })),
  keywords: z
    .object({ keywords: z.array(z.object({ name: z.string() })) })
    .optional()
    .default({ keywords: [] }),

  spoken_languages: z.array(z.object({ iso_639_1: z.string() })),
  production_countries: z.array(z.object({ iso_3166_1: z.string() })),
  production_companies: TmdbProductionCompaniesSchema,
  alternative_titles: z.object({ titles: TmdbAlternativeTitlesSchema }),
  images: TmdbImagesSchema,

  belongs_to_collection: z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable(),
      backdrop_path: z.string().nullable(),
    })
    .nullable(),

  translations: z.object({
    translations: z.array(
      z.object({
        iso_639_1: z.string(),
        data: z.object({
          homepage: z.string().nullable(),
          overview: z.string().nullable(),
          runtime: z.number().nullable(),
          tagline: z.string().nullable(),
          title: z.string().nullable(),
        }),
      }),
    ),
  }),

  release_dates: z
    .object({
      results: z.array(
        z.object({
          iso_3166_1: z.string(),
          release_dates: z.array(
            z.object({
              certification: z.string(),
              note: z.string(),
              release_date: z.string(),
              type: z.number(),
            }),
          ),
        }),
      ),
    })
    .optional()
    .default({ results: [] }),

  credits: z
    .object({
      cast: z.array(
        z
          .object({ cast_id: z.number(), character: z.string(), credit_id: z.string(), order: z.number() })
          .and(TmdbBasicPersonSchema),
      ),
      crew: z.array(
        z
          .object({ credit_id: z.string(), department: z.string(), job: z.string() })
          .and(TmdbBasicPersonSchema),
      ),
    })
    .optional()
    .default({ cast: [], crew: [] }),

  external_ids: z.object({
    imdb_id: z.string().nullable(),
    wikidata_id: z.string().nullable(),
    facebook_id: z.string().nullable(),
    instagram_id: z.string().nullable(),
    twitter_id: z.string().nullable(),
  }),

  videos: z.object({ results: TmdbVideosSchema }).optional().default({ results: [] }),
});
