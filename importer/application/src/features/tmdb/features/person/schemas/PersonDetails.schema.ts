import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';

export const PersonDetailsSchema = z
  .object({
    id: z.number(),

    name: z.string(),
    also_known_as: z.array(z.string()),
    biography: z.string(),
    gender: z.number(),

    birthday: z.string(),
    deathday: z.string().nullable(),
    place_of_birth: z.string(),

    homepage: z.string().nullable(),
    known_for_department: z.string(),

    popularity: z.number(),

    translations: z.object({
      translations: z.array(
        z.object({
          iso_639_1: z.string(),
          data: z.object({
            name: z.string().nullable(),
            biography: z.string().nullable(),
          }),
        }),
      ),
    }),

    external_ids: z.object({
      imdb_id: z.string().nullable(),
      freebase_mid: z.string().nullable(),
      freebase_id: z.string().nullable(),
      tvrage_id: z.number().nullable(),
      wikidata_id: z.string().nullable(),
      facebook_id: z.string().nullable(),
      instagram_id: z.string().nullable(),
      tiktok_id: z.string().nullable(),
      twitter_id: z.string().nullable(),
      youtube_id: z.string().nullable(),
    }),

    images: z
      .object({ profiles: z.array(TmdbImageSchema).optional().default([]) })
      .optional()
      .default({ profiles: [] }),

    movie_credits: z.object({
      cast: z.array(
        z.object({ id: z.number(), character: z.string(), credit_id: z.string(), order: z.number() }),
      ),
      crew: z.array(
        z.object({ id: z.number(), credit_id: z.string(), department: z.string(), job: z.string() }),
      ),
    }),

    tv_credits: z.object({
      cast: z.array(
        z.object({ id: z.number(), character: z.string(), credit_id: z.string(), episode_count: z.number() }),
      ),
      crew: z.array(
        z.object({
          id: z.number(),
          credit_id: z.string(),
          department: z.string(),
          episode_count: z.number(),
          job: z.string(),
        }),
      ),
    }),
  })
  .transform((data) => ({
    dynamic: {
      popularity: data.popularity,
    },
    static: {
      id: String(data.id),

      name: data.name,
      alsoKnownAs: data.also_known_as,
      biography: data.biography,
      gender: data.gender,

      birthday: data.birthday,
      deathday: data.deathday,
      placeOfBirth: data.place_of_birth,

      homepage: data.homepage,
      knownForDepartment: data.known_for_department,

      translations: data.translations.translations.reduce<
        Record<string, { biography?: string; name?: string }>
      >((acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.name ? { name: trans.data.name } : {}),
            ...(trans.data.biography ? { biography: trans.data.biography } : {}),
          },
        };
      }, {}),

      externalIds: {
        imdbId: data.external_ids.imdb_id,
        freebaseMid: data.external_ids.freebase_mid,
        freebaseId: data.external_ids.freebase_id,
        tvrageId: data.external_ids.tvrage_id,
        wikidataId: data.external_ids.wikidata_id,
        facebookId: data.external_ids.facebook_id,
        instagramId: data.external_ids.instagram_id,
        tiktokId: data.external_ids.tiktok_id,
        twitterId: data.external_ids.twitter_id,
        youtubeId: data.external_ids.youtube_id,
      },

      images: {
        profiles: filterImages(data.images.profiles),
      },

      movieCredits: {
        cast: data.movie_credits.cast.map((cast) => ({
          id: String(cast.id),
          character: cast.character,
          creditId: cast.credit_id,
          order: cast.order,
        })),
        crew: data.movie_credits.crew.map((cast) => ({
          id: String(cast.id),
          creditId: cast.credit_id,
          department: cast.department,
          job: cast.job,
        })),
      },

      tvCredits: {
        cast: data.tv_credits.cast.map((cast) => ({
          id: String(cast.id),
          character: cast.character,
          creditId: cast.credit_id,
          episodeCount: cast.episode_count,
        })),
        crew: data.tv_credits.crew.map((cast) => ({
          id: String(cast.id),
          creditId: cast.credit_id,
          department: cast.department,
          episodeCount: cast.episode_count,
          job: cast.job,
        })),
      },
    },
  }));

export type PersonDetails = z.infer<typeof PersonDetailsSchema>;
