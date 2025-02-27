import { z } from 'zod';

export const TmdbBasicPersonSchema = z.object({
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  known_for_department: z.string().nullable().optional().default(''),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().nullable(),
});
