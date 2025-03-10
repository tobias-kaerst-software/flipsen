import { TvDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvDetails.schema';
import { TvEpisodeDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvEpisodeDetails.schema';
import { TvSeasonDetailsSchema } from '$/features/tmdb/features/tv/schemas/TvSeasonDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';
import { group } from '$/lib/array';
import { logger } from '$/lib/logger';

export const getCompleteTvDetails = async (id: string) => {
  const rawTvDetails = await getTvDetails(id);
  if (!rawTvDetails.data) return { data: undefined, errors: [rawTvDetails] };
  const tvDetails = rawTvDetails.data!;

  const rawSeasons = await getBatchedSeasonDetails(id, tvDetails.static.seasons);

  if (rawSeasons.some((season) => !season.data)) {
    return { data: undefined, errors: rawSeasons.filter((season) => !season.data) };
  }

  const seasons = rawSeasons.map((season) => season.data!);

  const episodePromises = seasons.map((season) => {
    return getBatchedEpisodeDetails(
      id,
      season.static.seasonNumber,
      season.static.episodes.map((e) => e.static),
    );
  });

  const rawEpisodes = await Promise.all(episodePromises);

  const combined = {
    dynamic: {
      ...tvDetails.dynamic,
      seasons: seasons.map((season) => ({
        ...season.dynamic,
        seasonNumber: season.static.seasonNumber,
        episodes: season.static.episodes.map((episode) => ({
          ...episode.dynamic,
          episodeNumber: episode.static.episodeNumber,
        })),
      })),
    },
    static: {
      ...tvDetails.static,
      seasons: seasons.map((season, i) => {
        const episodes = rawEpisodes[i].map((episode, j) => {
          if (!episode.data) {
            const ep = season.static.episodes[j];

            logger.info(
              `Not found E${ep.static.episodeNumber}S${ep.static.seasonNumber} for show with id ${id}`,
              {
                type: 'episode_not_found',
                req: { tv: id, season: ep.static.seasonNumber, episode: ep.static.episodeNumber },
              },
            );

            return ep;
          }

          return episode.data.static;
        });

        return { ...season.static, episodes };
      }),
    },
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
  const batches = group(episodes, 3);

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
              ...res[`episode/${episodeNumber}`],
              id: parseInt(id, 10),
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
