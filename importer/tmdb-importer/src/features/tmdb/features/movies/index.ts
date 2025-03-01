import {
  type MovieDetails,
  MovieDetailsSchema,
} from '$/features/tmdb/features/movies/schemas/transformers/MovieDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';

export const getMovieDetailsById = async (id: string) => {
  const append = 'alternative_titles,keywords,translations,images,release_dates,credits,external_ids,videos';
  return tmdb(`movie/${id}`, { append_to_response: append }, MovieDetailsSchema.safeParse);
};

export const movieToBatchInput = (movie: MovieDetails) => {
  const translated = {
    title: movie.title,
    genres: movie.genres,
    keywords: movie.keywords,
    overview: movie.overview,
    ...movie.translations.find((t) => t.language === 'en')?.data,
  };

  return [
    `Title: ${translated.title || 'Unknown Title'}`,
    `Genres: ${translated.genres.join(', ') || 'Unknown Genres'}`,
    `Keywords: ${translated.keywords.join(', ') || 'Unknown Keywords'}`,
    `Overview: ${translated.overview || 'Unknown Overview'}`,
  ].join('; ');
};
