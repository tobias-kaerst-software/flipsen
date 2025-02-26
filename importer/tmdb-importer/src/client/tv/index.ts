import type { TvDetails } from '$/client/tv/schemas/transformers/TvDetails.schema';

import { TvDetailsSchema } from '$/client/tv/schemas/transformers/TvDetails.schema';
import {
  type TvEpisodeDetails,
  TvEpisodeDetailsSchema,
} from '$/client/tv/schemas/transformers/TvEpisodeDetails.schema';
import {
  type TvSeasonDetails,
  TvSeasonDetailsSchema,
} from '$/client/tv/schemas/transformers/TvSeasonDetails.schema';
import { tmdb } from '$/utils/clients/tmdb';
import { logger } from '$/utils/logger';

export const getCompleteTvDetails = async (id: string) => {
  const tv = await getTvDetails(id);
  if (!tv) return undefined;

  const seasons = await Promise.all(tv.seasons.map((season) => getTvSeasonDetails(id, season.seasonNumber))).catch(
    () => undefined,
  );

  if (!seasons || seasons.some((season) => !season)) return undefined;

  const episodes = await Promise.all(
    seasons.flatMap((season) =>
      season!.episodes.map((episode) => getTvEpisodeDetails(id, season!.seasonNumber, episode.episodeNumber)),
    ),
  ).catch(() => undefined);

  if (!episodes || episodes.some((episode) => !episode)) return undefined;

  const allGuests = Array.from(
    new Map(
      episodes.flatMap((episode) => episode!.credits.fullGuestsStars).map((guest) => [guest.id, guest]),
    ).values(),
  );

  return {
    ...tv,
    credits: { ...tv.credits, guests: allGuests },
    seasons: seasons.map((season) => ({
      ...season!,
      episodes: episodes
        .filter((episode) => episode!.seasonNumber === season!.seasonNumber)
        .map((episode) => {
          // @ts-expect-error The type gets adjusted in the next line
          delete episode!.credits.fullGuestsStars;
          return episode;
        }),
    })),
  };
};

export const getTvDetails = async (id: string): Promise<TvDetails | undefined> => {
  const searchParams = new URLSearchParams({
    language: 'de-DE',
    append_to_response:
      'alternative_titles,content_ratings,external_ids,images,keywords,translations,aggregate_credits',
    include_image_language: 'de,en,null',
  });

  const res = await tmdb
    .get(`tv/${id}`, { searchParams })
    .json()
    .catch((e) => e.name);

  const tv = TvDetailsSchema.safeParse(res);

  if (!tv.success) {
    return logger.error('COULD_NOT_FETCH_TV_DETAILS', tv.error, { id });
  }

  return tv.data;
};

export const getTvSeasonDetails = async (id: string, season: number): Promise<TvSeasonDetails | undefined> => {
  const searchParams = new URLSearchParams({
    language: 'de-DE',
    append_to_response: 'translations,external_ids,images,credits',
    include_image_language: 'de,en,null',
  });

  const res = await tmdb
    .get(`tv/${id}/season/${season}`, { searchParams })
    .json()
    .catch((e) => e.name);

  const tv = TvSeasonDetailsSchema.safeParse(res);

  if (!tv.success) {
    return logger.error('COULD_NOT_FETCH_TV_SEASON_DETAILS', tv.error, { id });
  }

  return tv.data;
};

export const getTvEpisodeDetails = async (
  id: string,
  season: number,
  episode: number,
): Promise<TvEpisodeDetails | undefined> => {
  const searchParams = new URLSearchParams({
    language: 'de-DE',
    append_to_response: 'images,translations,external_ids,credits',
    include_image_language: 'de,en,null',
  });

  const res = await tmdb
    .get(`tv/${id}/season/${season}/episode/${episode}`, { searchParams })
    .json()
    .catch((e) => e.name);

  const tv = TvEpisodeDetailsSchema.safeParse(res);

  if (!tv.success) {
    return logger.error('COULD_NOT_FETCH_TV_EPISODE_DETAILS', tv.error, { id });
  }

  return tv.data;
};
