import type { z } from 'zod';

import { RawTvSeasonDetailsSchema } from '$/client/tv/schemas/RawTvSeasonDetails.schema';

export const TvSeasonDetailsSchema = RawTvSeasonDetailsSchema.transform((data) => ({
  id: String(data.id),
  seasonNumber: data.season_number,

  name: data.name,
  overview: data.overview,
  firstAirDate: data.air_date,
  voteAverage: data.vote_average,

  images: data.images,

  translations: data.translations.translations
    .reduce<typeof data.translations.translations>((acc, translation) => {
      if (!acc.some((item) => item.iso_639_1 === translation.iso_639_1) && ['en'].includes(translation.iso_639_1))
        acc.push(translation);
      return acc;
    }, [])
    .map((translation) => ({
      language: translation.iso_639_1,
      data: {
        ...(translation.data.overview !== '' ? { overview: translation.data.overview } : {}),
        ...(translation.data.name !== '' ? { name: translation.data.name } : {}),
      },
    })),

  externalIds: {
    freebaseMid: data.external_ids.freebase_mid,
    freebaseId: data.external_ids.freebase_id,
    tvdbId: data.external_ids.tvdb_id,
    tvrageId: data.external_ids.tvrage_id,
    wikidataId: data.external_ids.wikidata_id,
  },

  credits: {
    cast: data.credits.cast.map((cast) => cast.credit_id),
    crew: data.credits.crew.map((crew) => crew.credit_id),
  },

  episodes: data.episodes.map((episode) => ({
    episodeNumber: episode.episode_number,
  })),
}));

export type TvSeasonDetails = z.infer<typeof TvSeasonDetailsSchema>;
