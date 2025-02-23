import {
  generateMovieEmbedding,
  getMovieDetailsById,
  transformMovieDetailsToSearchPayload,
} from './client/movies';

export const importer = async () => {
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

importer();
