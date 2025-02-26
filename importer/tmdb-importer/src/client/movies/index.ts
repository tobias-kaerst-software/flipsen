import type { MovieDetails } from '$/client/movies/schemas/transformers/MovieDetails.schema';

import { MovieDetailsSchema } from '$/client/movies/schemas/transformers/MovieDetails.schema';
import { openai } from '$/utils/clients/openai';
import { tmdb } from '$/utils/clients/tmdb';
import { logger } from '$/utils/logger';
import { EmbeddingResponseSchema } from '$/utils/schemas/openai.schema';

export const getMovieDetailsById = async (id: string): Promise<MovieDetails | undefined> => {
  const searchParams = new URLSearchParams({
    language: 'de-DE',
    append_to_response: 'alternative_titles,keywords,translations,images,release_dates,credits,external_ids',
    include_image_language: 'de,en,null',
  });

  const res = await tmdb
    .get(`movie/${id}`, { searchParams })
    .json()
    .catch((e) => e.name);

  const movie = MovieDetailsSchema.safeParse(res);

  if (!movie.success) {
    return logger.error('COULD_NOT_FETCH_MOVIE_DETAILS', movie.error, { id });
  }

  return movie.data;
};

export const transformMovieDetailsToSearchPayload = (movie: MovieDetails) => {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    tagline: movie.tagline,
    runtime: movie.runtime,
    voteAverage: movie.voteAverage,
    voteCount: movie.voteCount,
    releaseDate: movie.releaseDate,
    status: movie.status,
    popularity: movie.popularity,
    genres: movie.genres,
    keywords: movie.keywords,
    originCountry: movie.originCountry,
    belongsToCollection: movie.belongsToCollection,
    productionCompanies: movie.productionCompanies.map((company) => company.name),
  };
};

export const generateMovieEmbedding = async (movie: MovieDetails) => {
  const movieInput = `Title: ${movie.title}; Genres: ${movie.genres.join(', ')}; Keywords: ${movie.keywords.join(', ')}; Overview: ${movie.overview}.`;

  const res = await openai
    .post('embeddings ', {
      json: { input: movieInput, model: 'text-embedding-3-small', encoding_format: 'float' },
    })
    .json();

  const embedding = EmbeddingResponseSchema.safeParse(res);

  console.log(embedding);

  if (!embedding.success) {
    return logger.error('COULD_NOT_CREATE_MOVIE_EMBEDDING', embedding.error, { id: movie.id, movieInput });
  }

  return embedding.data.data[0].embedding;
};
