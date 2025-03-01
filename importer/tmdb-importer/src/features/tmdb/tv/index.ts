import { tmdb } from '$/features/tmdb/general/utils/tmdbClient';
import { TvDetailsSchema } from '$/features/tmdb/tv/schemas/transformers/TvDetails.schema';
import { TvEpisodeDetailsSchema } from '$/features/tmdb/tv/schemas/transformers/TvEpisodeDetails.schema';
import { TvSeasonDetailsSchema } from '$/features/tmdb/tv/schemas/transformers/TvSeasonDetails.schema';

export const getCompleteTvDetails = async (id: string) => {
  const tv = await getTvDetails(id);
  if (!tv.data) return { data: undefined, errors: [tv] };

  const seasons = await Promise.all(
    tv.data.seasons.map((season) => getTvSeasonDetails(id, season.seasonNumber)),
  );

  if (seasons.some((season) => !season.data)) {
    return { data: undefined, errors: seasons.filter((season) => !season.data) };
  }

  const episodes = await Promise.all(
    seasons.flatMap((season) =>
      season.data!.episodes.map((episode) =>
        getTvEpisodeDetails(id, season.data!.seasonNumber, episode.episodeNumber),
      ),
    ),
  );

  if (episodes.some((episode) => !episode.data)) {
    return { data: undefined, errors: episodes.filter((episode) => !episode.data) };
  }

  const guests = Array.from(
    new Map(
      episodes
        .flatMap((episode) => episode.data!.credits.fullGuestsStars ?? [])
        .map((guest) => [guest.id, guest]),
    ).values(),
  );

  return {
    data: {
      ...tv.data,
      credits: { ...tv.data.credits, guests },
      seasons: seasons.map((season) => ({
        ...season.data!,
        episodes: episodes
          .filter((episode) => episode.data!.seasonNumber === season.data!.seasonNumber)
          .map((episode) => {
            delete episode.data!.credits.fullGuestsStars;
            return episode.data!;
          }),
      })),
    },
    errors: undefined,
  };
};

export const getTvDetails = async (id: string) => {
  const append =
    'alternative_titles,content_ratings,external_ids,images,keywords,translations,aggregate_credits';
  return tmdb(`tv/${id}`, { append_to_response: append }, TvDetailsSchema.safeParse);
};

export const getTvSeasonDetails = async (id: string, season: number) => {
  return tmdb(
    `tv/${id}/season/${season}`,
    { append_to_response: 'translations,external_ids,images,credits,videos' },
    TvSeasonDetailsSchema.safeParse,
  );
};

export const getTvEpisodeDetails = async (id: string, season: number, episode: number) => {
  return tmdb(
    `tv/${id}/season/${season}/episode/${episode}`,
    { append_to_response: 'images,translations,external_ids,credits' },
    TvEpisodeDetailsSchema.safeParse,
  );
};
