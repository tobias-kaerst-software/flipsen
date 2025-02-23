import { z } from 'zod';

import { TmdbBasicMoviePersonSchema } from '$/client/movies/schemas/TmdbBasicMoviePerson.schema';
import { TmdbMovieImageSchema } from '$/client/movies/schemas/TmdbMovieImage.schema';

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
  keywords: z.object({ keywords: z.array(z.object({ name: z.string() })) }),

  spoken_languages: z.array(z.object({ iso_639_1: z.string() })),
  production_countries: z.array(z.object({ iso_3166_1: z.string() })),

  belongs_to_collection: z
    .object({ id: z.number(), name: z.string(), poster_path: z.string(), backdrop_path: z.string() })
    .nullable(),

  production_companies: z.array(
    z.object({ id: z.number(), name: z.string(), logo_path: z.string().nullable(), origin_country: z.string() }),
  ),

  alternative_titles: z.object({
    titles: z.array(z.object({ iso_3166_1: z.string(), title: z.string() })),
  }),

  translations: z.object({
    translations: z.array(
      z.object({
        iso_639_1: z.string(),
        data: z.object({
          homepage: z.string(),
          overview: z.string(),
          runtime: z.number(),
          tagline: z.string(),
          title: z.string(),
        }),
      }),
    ),
  }),

  images: z.object({
    backdrops: z.array(TmdbMovieImageSchema),
    logos: z.array(TmdbMovieImageSchema),
    posters: z.array(TmdbMovieImageSchema),
  }),

  release_dates: z.object({
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
  }),

  credits: z.object({
    cast: z.array(
      z
        .object({ cast_id: z.number(), character: z.string(), credit_id: z.string(), order: z.number() })
        .and(TmdbBasicMoviePersonSchema),
    ),
    crew: z.array(
      z.object({ credit_id: z.string(), department: z.string(), job: z.string() }).and(TmdbBasicMoviePersonSchema),
    ),
  }),

  external_ids: z.object({
    imdb_id: z.string().nullable(),
    wikidata_id: z.string().nullable(),
    facebook_id: z.string().nullable(),
    instagram_id: z.string().nullable(),
    twitter_id: z.string().nullable(),
  }),
});
