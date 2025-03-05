import { z } from 'zod';

export const TmdbProductionCompaniesSchema = z
  .array(
    z.object({
      id: z.number(),
      name: z.string(),
      logo_path: z.string().nullable(),
      origin_country: z.string(),
    }),
  )
  .transform((data) =>
    data.map((company) => ({
      id: String(company.id),
      name: company.name,
      logoPath: company.logo_path,
      originCountry: company.origin_country,
    })),
  );
