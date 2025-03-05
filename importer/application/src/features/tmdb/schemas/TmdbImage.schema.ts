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
