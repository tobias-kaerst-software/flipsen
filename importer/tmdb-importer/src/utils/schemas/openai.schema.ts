import { z } from 'zod';

export const EmbeddingResponseSchema = z.object({
  object: z.string(),
  data: z.array(
    z.object({
      object: z.literal('embedding'),
      index: z.number(),
      embedding: z.array(z.number()),
    }),
  ),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
});
