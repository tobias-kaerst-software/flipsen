import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';

export const TvEpisodeDetailsSchema = z
  .object({
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

    images: z
      .object({ stills: z.array(TmdbImageSchema).optional().default([]) })
      .optional()
      .default({ stills: [] }),

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

    external_ids: z.object({
      imdb_id: z.string().nullable(),
      freebase_mid: z.string().nullable(),
      freebase_id: z.string().nullable(),
      tvdb_id: z.number().nullable(),
      tvrage_id: z.number().nullable(),
      wikidata_id: z.string().nullable(),
    }),

    credits: z.object({
      cast: z.array(z.object({ id: z.number(), credit_id: z.string(), order: z.number() })),
      crew: z.array(z.object({ id: z.number(), credit_id: z.string() })),
      guest_stars: z.array(z.object({ id: z.number(), credit_id: z.string(), order: z.number() })),
    }),
  })
  .transform((data) => ({
    id: String(data.id),
    seasonNumber: data.season_number,
    episodeNumber: data.episode_number,

    name: data.name,
    overview: data.overview,
    firstAirDate: data.air_date,
    productionCode: data.production_code,
    runtime: data.runtime,

    voteAverage: data.vote_average,
    voteCount: data.vote_count,

    images: {
      stills: filterImages(data.images.stills),
    },

    translations: data.translations.translations.reduce<Record<string, { name?: string; overview?: string }>>(
      (acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.name ? { name: trans.data.name } : {}),
            ...(trans.data.overview ? { overview: trans.data.overview } : {}),
          },
        };
      },
      {},
    ),

    externalIds: {
      imdbId: data.external_ids.imdb_id,
      freebaseMid: data.external_ids.freebase_mid,
      freebaseId: data.external_ids.freebase_id,
      tvdbId: data.external_ids.tvdb_id,
      tvrageId: data.external_ids.tvrage_id,
      wikidataId: data.external_ids.wikidata_id,
    },

    credits: {
      cast: data.credits.cast.sort((a, b) => a.order - b.order).map((cast) => `${cast.id}-${cast.credit_id}`),
      crew: data.credits.crew.map((cast) => `${cast.id}-${cast.credit_id}`),
      guestStars: data.credits.guest_stars
        .sort((a, b) => a.order - b.order)
        .map((cast) => `${cast.id}-${cast.credit_id}`),
    },
  }));

export type TvEpisodeDetails = z.infer<typeof TvEpisodeDetailsSchema>;
