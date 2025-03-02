import { CollectionDetailsSchema } from '$/features/tmdb/features/collections/schemas/CollectionDetails.schema';
import { tmdb } from '$/features/tmdb/lib/http';

export const getCollectionDetails = async (id: string) => {
  return tmdb(
    `collection/${id}`,
    { append_to_response: 'images,translations' },
    CollectionDetailsSchema.safeParse,
  );
};
