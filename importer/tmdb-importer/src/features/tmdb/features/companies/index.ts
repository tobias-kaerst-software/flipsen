import { CompanyDetailsSchema } from '$/features/tmdb/features/companies/schemas/CompanyDetails';
import { tmdb } from '$/features/tmdb/lib/http';

export const getCompanyDetails = async (id: string) => {
  return tmdb(`company/${id}`, { append_to_response: 'alternative_names' }, CompanyDetailsSchema.safeParse);
};
