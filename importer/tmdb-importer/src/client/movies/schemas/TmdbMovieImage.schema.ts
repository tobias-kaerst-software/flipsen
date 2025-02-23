import { z } from 'zod';

export const TmdbMovieImageSchema = z.object({
  iso_639_1: z
    .string()
    .nullable()
    .transform((value) => value ?? 'global'),
  width: z.number(),
  height: z.number(),
  file_path: z.string(),
});
