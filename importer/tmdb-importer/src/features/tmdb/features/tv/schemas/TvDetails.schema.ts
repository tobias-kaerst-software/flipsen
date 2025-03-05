import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbProductionCompaniesSchema } from '$/features/tmdb/schemas/TmdbProductionCompanies.schema';

export const TvDetailsSchema = z
  .object({
    id: z.number(),

    name: z.string(),
    original_name: z.string(),
    alternative_titles: z.object({
      results: z.array(z.object({ iso_3166_1: z.string(), title: z.string() })),
    }),

    overview: z.string(),
    tagline: z.string(),
    homepage: z.string(),
    type: z.string(),

    origin_country: z.array(z.string()),
    original_language: z.string(),
    spoken_languages: z.array(z.object({ iso_639_1: z.string() })),
    languages: z.array(z.string()),

    first_air_date: z.string(),
    last_air_date: z.string().nullable(),
    status: z.string(),
    in_production: z.boolean(),

    vote_average: z.number(),
    vote_count: z.number(),
    popularity: z.number(),

    number_of_episodes: z.number().nullable(),
    number_of_seasons: z.number(),

    genres: z.array(z.object({ name: z.string() })),
    keywords: z.object({ results: z.array(z.object({ name: z.string() })) }),

    production_countries: z.array(z.object({ iso_3166_1: z.string() })),
    production_companies: TmdbProductionCompaniesSchema,

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
            homepage: z.string().nullable().default(''),
            overview: z.string().nullable().default(''),
            tagline: z.string().nullable().default(''),
            name: z.string().nullable().default(''),
          }),
        }),
      ),
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

    seasons: z.array(z.object({ id: z.number(), season_number: z.number(), episode_count: z.number() })),
  })
  .transform((data) => ({
    dynamic: {
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      popularity: data.popularity,
    },

    static: {
      id: String(data.id),

      name: data.name,
      originalName: data.original_name,
      alternativeTitles: data.alternative_titles.results.reduce<Record<string, string>>((acc, title) => {
        return title.iso_3166_1 in acc ? acc : { ...acc, [title.iso_3166_1]: title.title };
      }, {}),

      overview: data.overview,
      tagline: data.tagline,
      homepage: data.homepage,
      type: data.type,

      originCountry: data.origin_country,
      originalLanguage: data.original_language,
      spokenLanguages: data.spoken_languages.map((language) => language.iso_639_1),
      languages: data.languages,

      firstAirDate: data.first_air_date,
      lastAirDate: data.last_air_date,
      status: data.status,
      inProduction: data.in_production,

      genres: data.genres.map((genre) => genre.name),
      keywords: data.keywords.results.map((keyword) => keyword.name),

      productionCountries: data.production_countries.map((country) => country.iso_3166_1),
      productionCompanies: data.production_companies.map((company) => company.id),

      externalIds: {
        imdbId: data.external_ids.imdb_id,
        freebaseMid: data.external_ids.freebase_mid,
        freebaseId: data.external_ids.freebase_id,
        tvdbId: data.external_ids.tvdb_id,
        wikidataId: data.external_ids.wikidata_id,
        facebookId: data.external_ids.facebook_id,
        instagramId: data.external_ids.instagram_id,
        twitterId: data.external_ids.twitter_id,
      },

      images: {
        backdrops: filterImages(data.images.backdrops),
        logos: filterImages(data.images.logos),
        posters: filterImages(data.images.posters),
      },

      networks: data.networks.map((network) => String(network.id)),

      contentRatings: data.content_ratings.results.reduce<Record<string, string>>((acc, rating) => {
        return rating.iso_3166_1 in acc ? acc : { ...acc, [rating.iso_3166_1]: rating.rating };
      }, {}),

      translations: data.translations.translations.reduce<
        Record<string, { homepage?: string; name?: string; overview?: string; tagline?: string }>
      >((acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.name ? { name: trans.data.name } : {}),
            ...(trans.data.overview ? { overview: trans.data.overview } : {}),
            ...(trans.data.tagline ? { tagline: trans.data.tagline } : {}),
            ...(trans.data.homepage ? { homepage: trans.data.homepage } : {}),
          },
        };
      }, {}),

      seasons: data.seasons.map((season) => ({
        id: String(season.id),
        seasonNumber: season.season_number,
      })),
    },
  }));

export type TvDetails = z.infer<typeof TvDetailsSchema>;
