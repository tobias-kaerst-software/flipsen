import { TvDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvDetails.schema';
import { TvEpisodeDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvEpisodeDetails.schema';
import { TvSeasonDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvSeasonDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';
import { group } from '$/utils/array';
import { logger } from '$/utils/logger';

export const getCompleteTvDetails = async (id: string) => {
  const rawTvDetails = await getTvDetails(id);
  if (!rawTvDetails.data) return { data: undefined, errors: [rawTvDetails] };
  const tvDetails = rawTvDetails.data!;

  const rawSeasons = await getBatchedSeasonDetails(id, tvDetails.seasons);

  if (rawSeasons.some((season) => !season.data)) {
    return { data: undefined, errors: rawSeasons.filter((season) => !season.data) };
  }

  const seasons = rawSeasons.map((season) => season.data!);

  const episodePromises = seasons.map((season) => {
    return getBatchedEpisodeDetails(id, season.seasonNumber, season.episodes);
  });

  const rawEpisodes = await Promise.all(episodePromises);

  const combined = {
    ...tvDetails,
    seasons: seasons.map((season, i) => {
      const episodes = rawEpisodes[i].map((episode, j) => {
        if (!episode.data) {
          const ep = season.episodes[j];

          logger.info(`Not found E${ep.episodeNumber}S${ep.seasonNumber} for show with id ${id}`, {
            type: 'episode_not_found',
            req: { tv: id, season: ep.seasonNumber, episode: ep.episodeNumber },
          });

          return ep;
        }

        return episode.data;
      });

      return { ...season, episodes };
    }),
  };

  return { data: combined, errors: [] };
};

export const getTvDetails = async (id: string) => {
  const append = 'alternative_titles,content_ratings,external_ids,images,keywords,translations';
  return tmdb(`tv/${id}`, { append_to_response: append }, TvDetailsSchema.safeParse);
};

export const getBatchedSeasonDetails = async (
  id: string,
  seasons: { id: string; seasonNumber: number }[],
) => {
  const batches = group(seasons, 3);

  const promises = batches.map((batch) => {
    const appends = ['translations', 'external_ids', 'images', 'credits', 'videos'];
    const appendStr = batch
      .map(({ seasonNumber }) => {
        return `season/${seasonNumber},${appends.map((a) => `season/${seasonNumber}/${a}`)}`;
      })
      .join(',');

    return tmdb(`tv/${id}`, { append_to_response: appendStr });
  });

  const results = await Promise.all(promises);

  const responses = results
    .map((res) => res.data as Record<string, object>)
    .flatMap((res, i) =>
      batches[i].map(({ id, seasonNumber }) => ({
        id: parseInt(id, 10),
        ...res[`season/${seasonNumber}`],
        season_number: seasonNumber,
        translations: res[`season/${seasonNumber}/translations`],
        external_ids: res[`season/${seasonNumber}/external_ids`],
        images: res[`season/${seasonNumber}/images`],
        credits: res[`season/${seasonNumber}/credits`],
        videos: res[`season/${seasonNumber}/videos`],
      })),
    );

  return responses.map((raw) => {
    const data = TvSeasonDetailsSchema.safeParse(raw);

    if (!data.success) {
      logger.error(data.error.message, {
        type: 'zod_error',
        req: { url: `tv/${id}`, season: raw.season_number },
        error: data.error,
      });

      return { err: 'could_not_parse' as const, status: 500, data: undefined };
    }

    return { data: data.data, err: undefined, status: 200 };
  });
};

export const getBatchedEpisodeDetails = async (
  id: string,
  season: number,
  episodes: { episodeNumber: number; id: string }[],
) => {
  const batches = group(episodes, 4);

  const promises = batches.map((batch) => {
    const appends = ['translations', 'external_ids', 'images', 'credits'];
    const appendStr = batch
      .map(({ episodeNumber }) => {
        return `episode/${episodeNumber},${appends.map((a) => `episode/${episodeNumber}/${a}`)}`;
      })
      .join(',');

    return tmdb(`tv/${id}/season/${season}`, { append_to_response: appendStr });
  });

  const results = await Promise.all(promises);

  const responses = results
    .map((res) => res.data as Record<string, object>)
    .flatMap((res, i) =>
      batches[i].map(({ id, episodeNumber }) =>
        res[`episode/${episodeNumber}`]
          ? {
              id: parseInt(id, 10),
              ...res[`episode/${episodeNumber}`],
              season_number: season,
              episode_number: episodeNumber,
              translations: res[`episode/${episodeNumber}/translations`],
              external_ids: res[`episode/${episodeNumber}/external_ids`],
              images: res[`episode/${episodeNumber}/images`],
              credits: res[`episode/${episodeNumber}/credits`],
            }
          : null,
      ),
    );

  return responses.map((raw) => {
    if (!raw) {
      return { err: 'does_not_exist' as const, status: 404, data: undefined };
    }

    const data = TvEpisodeDetailsSchema.safeParse(raw);

    if (!data.success) {
      logger.error(data.error.message, {
        type: 'zod_error',
        req: { url: `tv/${id}/season/${season}`, episode: raw.episode_number },
        error: data.error,
      });

      return { err: 'could_not_parse' as const, status: 500, data: undefined };
    }

    return { data: data.data, err: undefined, status: 200 };
  });
};
