import { z } from 'zod';

export const CompanyDetailsSchema = z
  .object({
    id: z.number(),

    name: z.string(),
    description: z.string(),
    headquarters: z.string(),
    homepage: z.string(),
    logo_path: z.string().nullable(),

    origin_country: z.string().nullable(),
    parent_company: z.object({ id: z.number() }).nullable(),

    alternative_names: z.object({
      results: z.array(z.object({ type: z.string(), name: z.string() })),
    }),
  })
  .transform((data) => ({
    static: {
      id: String(data.id),

      name: data.name,
      description: data.description,
      headquarters: data.headquarters,
      homepage: data.homepage,
      logoPath: data.logo_path,

      originCountry: data.origin_country,
      parentCompany: data.parent_company ? String(data.parent_company?.id) : null,

      alternativeNames: data.alternative_names.results.map((name) => ({
        type: name.type,
        name: name.name,
      })),
    },
  }));

export type CompanyDetails = z.infer<typeof CompanyDetailsSchema>;
