import {
  type MovieDetails,
  MovieDetailsSchema,
} from '$/features/tmdb/features/movies/schemas/MovieDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';

export const getMovieDetails = async (id: string) => {
  const append = 'alternative_titles,keywords,translations,images,release_dates,credits,external_ids,videos';
  return tmdb(`movie/${id}`, { append_to_response: append }, MovieDetailsSchema.safeParse);
};

export const movieToBatchInput = (movie: MovieDetails) => {
  return [
    `Title: ${movie.static.title || 'Unknown Title'}`,
    `Genres: ${movie.static.genres.join(', ') || 'Unknown Genres'}`,
    `Keywords: ${movie.static.keywords.join(', ') || 'Unknown Keywords'}`,
    `Overview: ${movie.static.overview || 'Unknown Overview'}`,
  ].join('; ');
};
