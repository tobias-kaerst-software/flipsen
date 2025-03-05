import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { filterImages, TmdbImageSchema } from '$/features/tmdb/schemas/TmdbImage.schema';

export const CollectionDetailsSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    overview: z.string(),

    translations: z.object({
      translations: z.array(
        z.object({
          iso_639_1: z.string(),
          data: z.object({
            homepage: z.string().nullable().default(''),
            overview: z.string().nullable().default(''),
            title: z.string().nullable().default(''),
          }),
        }),
      ),
    }),

    images: z
      .object({
        backdrops: z.array(TmdbImageSchema).optional().default([]),
        posters: z.array(TmdbImageSchema).optional().default([]),
      })
      .optional()
      .default({ backdrops: [], posters: [] }),

    parts: z.array(z.object({ id: z.number(), media_type: z.literal('movie').or(z.literal('collection')) })),
  })
  .transform((data) => ({
    static: {
      id: String(data.id),

      name: data.name,
      overview: data.overview,

      translations: data.translations.translations.reduce<
        Record<string, { homepage?: string; overview?: string; title?: string }>
      >((acc, trans) => {
        if (trans.iso_639_1 in acc || !supportedTranslations.includes(trans.iso_639_1)) return acc;

        return {
          ...acc,
          [trans.iso_639_1]: {
            ...(trans.data.homepage ? { homepage: trans.data.homepage } : {}),
            ...(trans.data.overview ? { overview: trans.data.overview } : {}),
            ...(trans.data.title ? { title: trans.data.title } : {}),
          },
        };
      }, {}),

      images: {
        backdrops: filterImages(data.images.backdrops),
        posters: filterImages(data.images.posters),
      },

      movies: data.parts.filter((part) => part.media_type === 'movie').map((part) => String(part.id)),
      collections: data.parts
        .filter((part) => part.media_type === 'collection')
        .map((part) => String(part.id)),
    },
  }));

export type CollectionDetails = z.infer<typeof CollectionDetailsSchema>;
