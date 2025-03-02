import type { z } from 'zod';

import { RawTvSeasonDetailsSchema } from '$/features/tmdb/features/tv/schemas/RawTvSeasonDetails.schema';
import { supportedTranslations } from '$/features/tmdb/lib/http';

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
      if (
        !acc.some((item) => item.iso_639_1 === translation.iso_639_1) &&
        supportedTranslations.includes(translation.iso_639_1)
      )
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

  videos: data.videos.results,

  episodes: data.episodes.map((episode) => ({
    id: String(episode.id),
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,

    name: episode.name,
    overview: episode.overview,
    firstAirDate: episode.air_date,
    voteAverage: episode.vote_average,
    voteCount: episode.vote_count,
    productionCode: episode.production_code,
    runtime: episode.runtime,

    images: {
      backdrops: [],
      logos: [],
      posters: [],
      stills: [],
    },

    translations: [],

    externalIds: {
      imdbId: null,
      freebaseMid: null,
      freebaseId: null,
      tvdbId: null,
      tvrageId: null,
      wikidataId: null,
    },

    credits: {
      cast: episode.cast.map((cast) => cast.credit_id),
      crew: episode.crew.map((crew) => crew.credit_id),
      guestStars: episode.guest_stars?.map((guest) => guest.credit_id) ?? [],
      fullGuestsStars: episode.guest_stars?.map((guest) => ({
        adult: guest.adult,
        gender: guest.gender,
        id: guest.id,
        knownForDepartment: guest.known_for_department,
        name: guest.name,
        originalName: guest.original_name,
        popularity: guest.popularity,
        profilePath: guest.profile_path,
        character: guest.character,
        creditId: guest.credit_id,
        order: guest.order,
      })),
    },
  })),
}));

export type TvSeasonDetails = z.infer<typeof TvSeasonDetailsSchema>;
