import { PersonDetailsSchema } from '$/features/tmdb/features/person/schemas/PersonDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';

export const getPersonDetails = async (id: string) => {
  return tmdb(
    `person/${id}`,
    { append_to_response: 'external_ids,images,movie_credits,tv_credits,translations' },
    PersonDetailsSchema.safeParse,
  );
};
