import { z } from 'zod';

export const ChangesSchema = z
  .object({
    results: z.array(
      z.object({
        id: z.number(),
        adult: z.boolean().nullable(),
      }),
    ),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
  })
  .transform((data) => ({
    results: data.results.filter((result) => !result.adult).map((result) => ({ id: result.id })),
    page: data.page,
    totalPages: data.total_pages,
  }));
