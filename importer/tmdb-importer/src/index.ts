import { getCompleteTvDetails } from '$/client/tv';

import {
  generateMovieEmbedding,
  getMovieDetailsById,
  transformMovieDetailsToSearchPayload,
} from './client/movies';

export const movieImporter = async () => {
  const movieId = '549509';

  const movie = await getMovieDetailsById(movieId);

  if (movie) {
    Bun.write(`output/${movieId}.json`, JSON.stringify(movie, null, 2));

    const movieSearchPayload = transformMovieDetailsToSearchPayload(movie);

    const movieEmbedding = await generateMovieEmbedding(movie);

    Bun.write(
      `output/${movieId}.search.json`,
      JSON.stringify({ ...movieSearchPayload, embedding: movieEmbedding }, null, 0),
    );
  }

  return null;
};

export const tvImporter = async () => {
  const tvId = '94605';

  // const tv = await getTvDetails(tvId);
  // const tv = await getTvSeasonDetails(tvId, 1);
  // const tv = await getTvEpisodeDetails(tvId, 1, 1);

  const tv = await getCompleteTvDetails(tvId);

  if (tv) {
    Bun.write(`output/${tvId}.json`, JSON.stringify(tv, null, 2));
  }
};

tvImporter();
