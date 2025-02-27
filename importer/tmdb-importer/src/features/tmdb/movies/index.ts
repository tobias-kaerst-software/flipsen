import type { AxiosError } from 'axios';

import {
  type MovieDetails,
  MovieDetailsSchema,
} from '$/features/tmdb/movies/schemas/transformers/MovieDetails.schema';
import { tmdb } from '$/utils/clients/tmdb';
import { logger } from '$/utils/logger';

type MovieDetailsResponse = {
  data: MovieDetails | undefined;
  err?: 'COULD_NOT_FETCH_MOVIE_DETAILS' | 'COULD_NOT_PARSE_MOVIE_DETAILS';
  status: number;
};

export const getMovieDetailsById = async (id: string): Promise<MovieDetailsResponse> => {
  const params = {
    language: 'de-DE',
    append_to_response:
      'alternative_titles,keywords,translations,images,release_dates,credits,external_ids,videos',
    include_image_language: 'de,en,null',
    include_video_language: 'de,en,null',
  };

  const res = await tmdb.get(`movie/${id}`, { params }).catch((e: AxiosError) => {
    logger.error('COULD_NOT_FETCH_MOVIE_DETAILS', e, { id });
    return e.status ?? 500;
  });

  if (typeof res === 'number') {
    return { err: 'COULD_NOT_FETCH_MOVIE_DETAILS', status: res, data: undefined };
  }

  const movie = MovieDetailsSchema.safeParse(res.data);

  if (!movie.success) {
    logger.error('COULD_NOT_PARSE_MOVIE_DETAILS', movie.error, { id });
    return { err: 'COULD_NOT_PARSE_MOVIE_DETAILS', status: 500, data: undefined };
  }

  return { data: movie.data, err: undefined, status: 200 };
};

export const movieToBatchEmbeddingOperation = (movie: MovieDetails) => {
  const movieInput = [
    `Title: ${movie.title}`,
    `Genres: ${movie.genres.join(', ')}`,
    `Keywords: ${movie.keywords.join(', ')}`,
    `Overview: ${movie.overview}`,
  ].join('; ');

  const request = {
    custom_id: movie.id,
    method: 'POST',
    url: '/v1/embeddings',
    body: { input: movieInput, model: 'text-embedding-3-small' },
  };

  return JSON.stringify(request, null, 0);
};
