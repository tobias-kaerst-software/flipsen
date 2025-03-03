import { z } from 'zod';

export const TmdbImageSchema = z.object({
  iso_639_1: z
    .string()
    .nullable()
    .transform((value) => value ?? 'global'),
  width: z.number(),
  height: z.number(),
  file_path: z.string(),
});

export const filterImages = (images: z.infer<typeof TmdbImageSchema>[]) => {
  return images
    .reduce<typeof images>((acc, backdrop) => {
      if (!acc.some((item) => item.iso_639_1 === backdrop.iso_639_1)) acc.push(backdrop);
      return acc;
    }, [])
    .map((backdrop) => ({
      lang: backdrop.iso_639_1,
      width: backdrop.width,
      height: backdrop.height,
      path: backdrop.file_path,
    }));
};

export const TmdbImagesSchema = z
  .object({
    backdrops: z.array(TmdbImageSchema).optional().default([]),
    logos: z.array(TmdbImageSchema).optional().default([]),
    posters: z.array(TmdbImageSchema).optional().default([]),
    stills: z.array(TmdbImageSchema).optional().default([]),
  })
  .optional()
  .default({ backdrops: [], logos: [], posters: [], stills: [] })
  .transform((data) => ({
    backdrops: data.backdrops
      .reduce<typeof data.backdrops>((acc, backdrop) => {
        if (!acc.some((item) => item.iso_639_1 === backdrop.iso_639_1)) acc.push(backdrop);
        return acc;
      }, [])
      .map((backdrop) => ({
        lang: backdrop.iso_639_1,
        width: backdrop.width,
        height: backdrop.height,
        path: backdrop.file_path,
      })),

    logos: data.logos
      .reduce<typeof data.logos>((acc, logo) => {
        if (!acc.some((item) => item.iso_639_1 === logo.iso_639_1)) acc.push(logo);
        return acc;
      }, [])
      .map((logo) => ({
        lang: logo.iso_639_1,
        width: logo.width,
        height: logo.height,
        path: logo.file_path,
      })),

    posters: data.posters
      .reduce<typeof data.posters>((acc, poster) => {
        if (!acc.some((item) => item.iso_639_1 === poster.iso_639_1)) acc.push(poster);
        return acc;
      }, [])
      .map((poster) => ({
        lang: poster.iso_639_1,
        width: poster.width,
        height: poster.height,
        path: poster.file_path,
      })),

    stills: data.stills
      .reduce<typeof data.stills>((acc, still) => {
        if (!acc.some((item) => item.iso_639_1 === still.iso_639_1)) acc.push(still);
        return acc;
      }, [])
      .map((still) => ({
        lang: still.iso_639_1,
        width: still.width,
        height: still.height,
        path: still.file_path,
      })),
  }));
