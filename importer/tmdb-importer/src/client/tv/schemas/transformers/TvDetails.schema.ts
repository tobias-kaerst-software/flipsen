import type { z } from 'zod';

import { RawTvDetailsSchema } from '$/client/tv/schemas/RawTvDetails.schema';

export const TvDetailsSchema = RawTvDetailsSchema.transform((data) => ({
  id: String(data.id),

  name: data.name,
  originalName: data.original_name,
  overview: data.overview,
  tagline: data.tagline,
  homepage: data.homepage,

  firstAirDate: data.first_air_date,
  lastAirDate: data.last_air_date,
  status: data.status,
  voteAverage: data.vote_average,
  voteCount: data.vote_count,
  type: data.type,

  popularity: data.popularity,
  originalLanguage: data.original_language,
  originCountry: data.origin_country,
  languages: data.languages,

  number_of_episodes: data.number_of_episodes,
  number_of_seasons: data.number_of_seasons,
  in_production: data.in_production,

  genres: data.genres.map((genre) => genre.name),
  keywords: data.keywords.results.map((keyword) => keyword.name),

  spokenLanguages: data.spoken_languages.map((language) => language.iso_639_1),
  productionCountries: data.production_countries.map((country) => country.iso_3166_1),

  productionCompanies: data.production_companies,
  alternativeTitles: data.alternative_titles,
  images: data.images,

  translations: data.translations.translations
    .reduce<typeof data.translations.translations>((acc, translation) => {
      if (!acc.some((item) => item.iso_639_1 === translation.iso_639_1) && ['en'].includes(translation.iso_639_1))
        acc.push(translation);
      return acc;
    }, [])
    .map((translation) => ({
      language: translation.iso_639_1,
      data: {
        ...(translation.data.homepage !== '' ? { homepage: translation.data.homepage } : {}),
        ...(translation.data.overview !== '' ? { overview: translation.data.overview } : {}),
        ...(translation.data.tagline !== '' ? { tagline: translation.data.tagline } : {}),
        ...(translation.data.name !== '' ? { name: translation.data.name } : {}),
      },
    })),

  externalIds: {
    imdbId: data.external_ids.imdb_id,
    freebaseMid: data.external_ids.freebase_mid,
    freebaseId: data.external_ids.freebase_id,
    tvdbId: data.external_ids.tvdb_id,
    wikidataId: data.external_ids.wikidata_id,
    facebookId: data.external_ids.facebook_id,
    instagramId: data.external_ids.instagram_id,
    twitterId: data.external_ids.twitter_id,
  },

  networks: data.networks.map((network) => ({
    id: String(network.id),
    logoPath: network.logo_path,
    name: network.name,
    originCountry: network.origin_country,
  })),

  contentRatings: data.content_ratings.results.map((rating) => ({
    country: rating.iso_3166_1,
    rating: rating.rating,
  })),

  credits: {
    cast: data.aggregate_credits.cast.map((cast) => ({
      adult: cast.adult,
      gender: cast.gender,
      id: cast.id,
      knownForDepartment: cast.known_for_department,
      name: cast.name,
      originalName: cast.original_name,
      popularity: cast.popularity,
      profilePath: cast.profile_path,
      totalEpisodeCount: cast.total_episode_count,
      roles: cast.roles.map((role) => ({
        character: role.character,
        episodeCount: role.episode_count,
        creditId: role.credit_id,
      })),
      order: cast.order,
    })),
    crew: data.aggregate_credits.crew.map((cast) => ({
      adult: cast.adult,
      gender: cast.gender,
      id: cast.id,
      knownForDepartment: cast.known_for_department,
      name: cast.name,
      originalName: cast.original_name,
      popularity: cast.popularity,
      profilePath: cast.profile_path,
      department: cast.department,
      jobs: cast.jobs.map((job) => ({ job: job.job, episodeCount: job.episode_count, creditId: job.credit_id })),
    })),
  },

  seasons: data.seasons.map((season) => ({
    seasonNumber: season.season_number,
  })),
}));

export type TvDetails = z.infer<typeof TvDetailsSchema>;
