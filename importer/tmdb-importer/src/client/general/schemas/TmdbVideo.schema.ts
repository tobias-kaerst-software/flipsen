import { string, z } from 'zod';

export const TmdbVideoSchema = z
  .object({
    iso_639_1: z
      .string()
      .nullable()
      .transform((value) => value ?? 'global'),
    name: string(),
    key: string(),
    site: string(),
    size: z.number(),
    type: string(),
    official: z.boolean(),
    published_at: z.string(),
    id: z.string(),
  })
  .transform((data) => ({
    lang: data.iso_639_1,
    name: data.name,
    key: data.key,
    site: data.site,
    size: data.size,
    type: data.type,
    official: data.official,
    publishedAt: data.published_at,
    id: data.id,
  }));

export const TmdbVideosSchema = z.array(TmdbVideoSchema).transform((data) =>
  data.reduce<typeof data>((acc, video) => {
    if (!acc.some((item) => item.lang === video.lang && item.type === video.type)) acc.push(video);
    return acc;
  }, []),
);
