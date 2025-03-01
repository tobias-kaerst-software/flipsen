import type { z } from 'zod';

import { TmdbMovieDetailsSchema } from '$/features/tmdb/movies/schemas/TmdbMovieDetails.schema';

export const MovieDetailsSchema = TmdbMovieDetailsSchema.transform((data) => ({
  id: String(data.id),

  title: data.title,
  originalTitle: data.original_title,
  overview: data.overview,
  tagline: data.tagline,
  homepage: data.homepage,

  runtime: data.runtime,
  releaseDate: data.release_date,
  status: data.status,
  video: data.video,
  voteAverage: data.vote_average,
  voteCount: data.vote_count,

  budget: data.budget,
  revenue: data.revenue,
  popularity: data.popularity,
  originalLanguage: data.original_language,

  belongsToCollection: data.belongs_to_collection
    ? {
        id: String(data.belongs_to_collection.id),
        name: data.belongs_to_collection.name,
        posterPath: data.belongs_to_collection.poster_path,
        backdropPath: data.belongs_to_collection.backdrop_path,
      }
    : null,

  originCountry: data.origin_country,

  genres: data.genres.map((genre) => genre.name),
  keywords: data.keywords.keywords.map((keyword) => keyword.name),

  spokenLanguages: data.spoken_languages.map((language) => language.iso_639_1),
  productionCountries: data.production_countries.map((country) => country.iso_3166_1),

  productionCompanies: data.production_companies,
  alternativeTitles: data.alternative_titles.titles,
  images: data.images,

  translations: data.translations.translations
    .reduce<typeof data.translations.translations>((acc, translation) => {
      if (
        !acc.some((item) => item.iso_639_1 === translation.iso_639_1) &&
        ['en'].includes(translation.iso_639_1)
      )
        acc.push(translation);
      return acc;
    }, [])
    .map((translation) => ({
      language: translation.iso_639_1,
      data: {
        ...(translation.data.homepage ? { homepage: translation.data.homepage } : {}),
        ...(translation.data.overview ? { overview: translation.data.overview } : {}),
        ...(translation.data.tagline ? { tagline: translation.data.tagline } : {}),
        ...(translation.data.runtime ? { runtime: translation.data.runtime } : {}),
        ...(translation.data.title ? { title: translation.data.title } : {}),
      },
    })),

  releaseDates: data.release_dates.results.map((result) => ({
    country: result.iso_3166_1,
    releaseDates: result.release_dates.map((releaseDate) => ({
      certification: releaseDate.certification,
      note: releaseDate.note,
      releaseDate: releaseDate.release_date,
      type: releaseDate.type,
    })),
  })),

  credits: {
    cast: data.credits.cast.map((cast) => ({
      adult: cast.adult,
      gender: cast.gender,
      id: cast.id,
      knownForDepartment: cast.known_for_department,
      name: cast.name,
      originalName: cast.original_name,
      popularity: cast.popularity,
      profilePath: cast.profile_path,
      castId: String(cast.cast_id),
      character: cast.character,
      creditId: cast.credit_id,
      order: cast.order,
    })),
    crew: data.credits.crew.map((cast) => ({
      adult: cast.adult,
      gender: cast.gender,
      id: cast.id,
      knownForDepartment: cast.known_for_department,
      name: cast.name,
      originalName: cast.original_name,
      popularity: cast.popularity,
      profilePath: cast.profile_path,
      creditId: cast.credit_id,
      department: cast.department,
      job: cast.job,
    })),
  },

  externalIds: {
    imdbId: data.external_ids.imdb_id,
    wikidataId: data.external_ids.wikidata_id,
    facebookId: data.external_ids.facebook_id,
    instagramId: data.external_ids.instagram_id,
    twitterId: data.external_ids.twitter_id,
  },

  videos: data.videos.results,
}));

export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
