import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';
import { TmdbVideosSchema } from '$/features/tmdb/schemas/TmdbVideo.schema';

export const TvSeasonDetailsSchema = z
  .object({
    id: z.number(),
    season_number: z.number(),

    name: z.string(),
    overview: z.string(),
    air_date: z.string().nullable(),

    vote_average: z.number(),

    images: z
      .object({ posters: z.array(TmdbImageSchema).optional().default([]) })
      .optional()
      .default({ posters: [] }),

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
        cast: z.array(z.object({ id: z.number(), credit_id: z.string(), order: z.number() })),
        crew: z.array(z.object({ id: z.number(), credit_id: z.string() })),
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
        production_code: z.string(),
        air_date: z.string().nullable(),
        runtime: z.number().nullable(),

        vote_average: z.number(),
        vote_count: z.number(),

        still_path: z.string().nullable(),

        crew: z.array(z.object({ id: z.number().optional(), credit_id: z.string() })),
        guest_stars: z.array(
          z.object({ id: z.number().optional(), credit_id: z.string(), order: z.number() }),
        ),
      }),
    ),
  })
  .transform((data) => ({
    dynamic: {
      voteAverage: data.vote_average,
    },
    static: {
      id: String(data.id),
      seasonNumber: data.season_number,

      name: data.name,
      overview: data.overview,
      firstAirDate: data.air_date,

      externalIds: {
        freebaseMid: data.external_ids.freebase_mid,
        freebaseId: data.external_ids.freebase_id,
        tvdbId: data.external_ids.tvdb_id,
        tvrageId: data.external_ids.tvrage_id,
        wikidataId: data.external_ids.wikidata_id,
      },

      images: {
        posters: filterImages(data.images.posters),
      },

      videos: data.videos.results,

      translations: data.translations.translations.reduce<
        Record<string, { name?: string; overview?: string }>
      >((acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.name ? { name: trans.data.name } : {}),
            ...(trans.data.overview ? { overview: trans.data.overview } : {}),
          },
        };
      }, {}),

      credits: {
        cast: data.credits.cast
          .sort((a, b) => a.order - b.order)
          .map((cast) => `${cast.id}-${cast.credit_id}`),
        crew: data.credits.crew.map((cast) => `${cast.id}-${cast.credit_id}`),
      },

      episodes: data.episodes.map((episode) => ({
        dynamic: {
          voteAverage: episode.vote_average,
          voteCount: episode.vote_count,
        },
        static: {
          id: String(episode.id),
          seasonNumber: episode.season_number,
          episodeNumber: episode.episode_number,

          name: episode.name,
          overview: episode.overview,
          firstAirDate: episode.air_date,
          productionCode: episode.production_code,
          runtime: episode.runtime,

          images: {
            stills: episode.still_path
              ? [
                  {
                    lang: 'global',
                    width: 1290,
                    height: 726,
                    path: episode.still_path,
                  },
                ]
              : [],
          },

          translations: {},

          externalIds: {
            imdbId: null,
            freebaseMid: null,
            freebaseId: null,
            tvdbId: null,
            tvrageId: null,
            wikidataId: null,
          },

          credits: {
            cast: [],
            crew: episode.crew.filter((crew) => crew.id).map((cast) => `${cast.id}-${cast.credit_id}`),
            guestStars: episode.guest_stars
              .filter((guest) => guest.id)
              .sort((a, b) => a.order - b.order)
              .map((cast) => `${cast.id}-${cast.credit_id}`),
          },
        },
      })),
    },
  }));

export type TvSeasonDetails = z.infer<typeof TvSeasonDetailsSchema>;
