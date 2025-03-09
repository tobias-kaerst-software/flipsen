import type { MovieDetails } from '$/features/tmdb/features/movies/schemas/MovieDetails.schema';

export type MovieItem = {
  ratings: {
    internal: {
      popularity: number;
      voteAverage: number;
      voteCount: number;
    };
    tmdb: {
      popularity: number;
      voteAverage: number;
      voteCount: number;
    };
  };
  tmdb: {
    genres: string[];
    id: string;
    keywords: string[];
    originalLanguage: string;
    originCountry: string[];
    overview: string;
    releaseDate: string;
    runtime: number;
    status: string;
    tagline: string;
    title: string;
    translations: {
      [key: string]: {
        homepage?: string;
        overview?: string;
        runtime?: number;
        tagline?: string;
        title?: string;
      };
    };
  };
};

export const movieViewFacet = {
  generateItem: (movie: MovieDetails): MovieItem => {
    return {
      tmdb: {
        id: movie.static.id,
        title: movie.static.title,
        overview: movie.static.overview,
        tagline: movie.static.tagline,
        runtime: movie.static.runtime,
        releaseDate: movie.static.releaseDate,
        status: movie.static.status,
        genres: movie.static.genres,
        keywords: movie.static.keywords,
        originCountry: movie.static.originCountry,
        originalLanguage: movie.static.originalLanguage,
        translations: movie.static.translations,
      },
      ratings: {
        tmdb: {
          voteAverage: movie.dynamic.voteAverage,
          voteCount: movie.dynamic.voteCount,
          popularity: movie.dynamic.popularity,
        },
        internal: {
          voteAverage: 0,
          voteCount: 0,
          popularity: 0,
        },
      },
    };
  },

  generateState: (id: string, item: MovieItem) => {
    const hashString = JSON.stringify({ ...item.tmdb, ...item.ratings.tmdb });
    return { id, hash: Bun.hash(hashString), dependencies: { movies: [item.tmdb.id] } };
  },
};
