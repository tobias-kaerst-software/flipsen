import { ChangesSchema } from '$/features/tmdb/features/changes/schemas/Changes.schema';
import { tmdb } from '$/features/tmdb/lib/http';

export const getTmdbChanges = async (type: 'movie' | 'person' | 'tv', start: string, end: string) => {
  const initial = await tmdb('movie/changes', { start_date: start, end_date: end, page: '1' }, (data) =>
    ChangesSchema.safeParse(data),
  );

  if (!initial.data) return { data: undefined, errors: [initial.err] };

  const promises = Array.from({ length: initial.data.totalPages - 1 }, (_, i) =>
    tmdb(`${type}/changes`, { start_date: start, end_date: end, page: String(i + 2) }, (data) =>
      ChangesSchema.safeParse(data),
    ),
  );

  const results = await Promise.all(promises);

  if (results.some((result) => result.err)) {
    return { data: undefined, errors: results.map((result) => result.err) };
  }

  return {
    data: results.reduce((acc, result) => acc.concat(result.data!.results), initial.data.results),
    errors: [],
  };
};
