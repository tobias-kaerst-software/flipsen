import { z } from 'zod';

import { supportedTranslations } from '$/features/tmdb/lib/http';
import { TmdbImagesSchema } from '$/features/tmdb/schemas/TmdbImage.schema';

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
            homepage: z.string().nullable(),
            overview: z.string().nullable(),
            title: z.string().nullable(),
          }),
        }),
      ),
    }),

    images: TmdbImagesSchema,

    parts: z.array(z.object({ id: z.number(), media_type: z.literal('movie').or(z.literal('collection')) })),
  })
  .transform((data) => ({
    id: String(data.id),
    name: data.name,
    overview: data.overview,

    translations: data.translations.translations
      .reduce<typeof data.translations.translations>((acc, translation) => {
        if (
          !acc.some((item) => item.iso_639_1 === translation.iso_639_1) &&
          supportedTranslations.includes(translation.iso_639_1)
        )
          acc.push(translation);
        return acc;
      }, [])
      .map((translation) => ({
        language: translation.iso_639_1,
        data: {
          ...(translation.data.homepage ? { homepage: translation.data.homepage } : {}),
          ...(translation.data.overview ? { overview: translation.data.overview } : {}),
          ...(translation.data.title ? { title: translation.data.title } : {}),
        },
      })),

    image: data.images,

    parts: data.parts
      .filter((part) => part.id !== data.id)
      .map((part) => ({ id: String(part.id), mediaType: part.media_type })),
  }));
