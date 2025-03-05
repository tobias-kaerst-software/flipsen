import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbProductionCompaniesSchema } from '$/features/tmdb/schemas/TmdbProductionCompanies.schema';
import { TmdbVideosSchema } from '$/features/tmdb/schemas/TmdbVideo.schema';

export const MovieDetailsSchema = z
  .object({
    id: z.number(),

    title: z.string(),
    original_title: z.string(),
    alternative_titles: z.object({
      titles: z.array(z.object({ iso_3166_1: z.string(), title: z.string() })),
    }),

    overview: z.string(),
    tagline: z.string(),
    homepage: z.string(),

    origin_country: z.array(z.string()),
    original_language: z.string(),
    spoken_languages: z.array(z.object({ iso_639_1: z.string() })),

    release_date: z.string(),
    status: z.string(),

    runtime: z.number(),
    budget: z.number(),
    revenue: z.number(),
    video: z.boolean(),

    vote_average: z.number(),
    vote_count: z.number(),
    popularity: z.number(),

    belongs_to_collection: z.object({ id: z.number() }).nullable(),

    genres: z.array(z.object({ name: z.string() })),

    keywords: z
      .object({ keywords: z.array(z.object({ name: z.string() })) })
      .optional()
      .default({ keywords: [] }),

    production_countries: z.array(z.object({ iso_3166_1: z.string() })),
    production_companies: TmdbProductionCompaniesSchema,

    external_ids: z.object({
      imdb_id: z.string().nullable(),
      wikidata_id: z.string().nullable(),
      facebook_id: z.string().nullable(),
      instagram_id: z.string().nullable(),
      twitter_id: z.string().nullable(),
    }),

    videos: z.object({ results: TmdbVideosSchema }).optional().default({ results: [] }),

    images: z
      .object({
        backdrops: z.array(TmdbImageSchema).optional().default([]),
        logos: z.array(TmdbImageSchema).optional().default([]),
        posters: z.array(TmdbImageSchema).optional().default([]),
      })
      .optional()
      .default({ backdrops: [], logos: [], posters: [] }),

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
        cast: z.array(z.object({ id: z.number(), credit_id: z.string(), order: z.number() })),
        crew: z.array(z.object({ id: z.number(), credit_id: z.string(), department: z.string() })),
      })
      .optional()
      .default({ cast: [], crew: [] }),
  })
  .transform((data) => ({
    dynamic: {
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      popularity: data.popularity,
    },
    static: {
      id: String(data.id),

      title: data.title,
      originalTitle: data.original_title,
      alternativeTitles: data.alternative_titles.titles.reduce<Record<string, string>>((acc, title) => {
        return title.iso_3166_1 in acc ? acc : { ...acc, [title.iso_3166_1]: title.title };
      }, {}),

      overview: data.overview,
      tagline: data.tagline,
      homepage: data.homepage,

      originCountry: data.origin_country,
      spokenLanguages: data.spoken_languages.map((language) => language.iso_639_1),
      originalLanguage: data.original_language,
      releaseDate: data.release_date,
      status: data.status,

      runtime: data.runtime,
      revenue: data.revenue,
      budget: data.budget,
      isVideo: data.video,

      belongsToCollection: data.belongs_to_collection ? String(data.belongs_to_collection.id) : null,

      genres: data.genres.map((genre) => genre.name),
      keywords: data.keywords.keywords.map((keyword) => keyword.name),

      productionCountries: data.production_countries.map((country) => country.iso_3166_1),
      productionCompanies: data.production_companies.map((company) => company.id),

      externalIds: {
        imdbId: data.external_ids.imdb_id,
        wikidataId: data.external_ids.wikidata_id,
        facebookId: data.external_ids.facebook_id,
        instagramId: data.external_ids.instagram_id,
        twitterId: data.external_ids.twitter_id,
      },

      videos: data.videos.results,

      images: {
        backdrops: filterImages(data.images.backdrops),
        logos: filterImages(data.images.logos),
        posters: filterImages(data.images.posters),
      },

      releaseDates: data.release_dates.results.reduce<
        Record<string, { certification: string; note: string; releaseDate: string; type: number }[]>
      >((acc, result) => {
        if (result.iso_3166_1 in acc) return acc;
        return {
          ...acc,
          [result.iso_3166_1]: result.release_dates.map((releaseDate) => ({
            certification: releaseDate.certification,
            note: releaseDate.note,
            releaseDate: releaseDate.release_date,
            type: releaseDate.type,
          })),
        };
      }, {}),

      translations: data.translations.translations.reduce<
        Record<
          string,
          { homepage?: string; overview?: string; runtime?: number; tagline?: string; title?: string }
        >
      >((acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.title ? { title: trans.data.title } : {}),
            ...(trans.data.tagline ? { tagline: trans.data.tagline } : {}),
            ...(trans.data.overview ? { overview: trans.data.overview } : {}),
            ...(trans.data.homepage ? { homepage: trans.data.homepage } : {}),
            ...(trans.data.runtime ? { runtime: trans.data.runtime } : {}),
          },
        };
      }, {}),

      credits: {
        cast: data.credits.cast
          .sort((a, b) => a.order - b.order)
          .map((cast) => ({
            id: String(cast.id),
            creditId: cast.credit_id,
          })),
        crew: data.credits.crew.map((cast) => ({
          id: String(cast.id),
          creditId: cast.credit_id,
        })),
      },
    },
  }));

export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
