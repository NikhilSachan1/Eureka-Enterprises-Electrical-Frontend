import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { CompanyBaseSchema } from './base-company.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const CompanyGetRequestSchema = z
  .object({
    parentCompanyName: z.array(z.string()).optional(),
    companyState: z.array(z.string()).optional(),
    companyCity: z.array(z.string()).optional(),
    companyStatus: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      parentCompanyName,
      companyState,
      companyCity,
      companyStatus,
      ...rest
    }) => {
      return {
        ...rest,
        city: companyCity,
        state: companyState,
        isActive: companyStatus,
        parentCompanyId: parentCompanyName,
      };
    }
  );

export const CompanyGetBaseResponseSchema = CompanyBaseSchema.extend({
  ...AuditSchema.shape,
  fullAddress: z.string().nullable(),
  parentCompany: CompanyBaseSchema.pick({
    id: true,
    name: true,
    logo: true,
  })
    .extend({
      fullAddress: z.string().nullable(),
    })
    .loose()
    .nullable(),
}).loose();

export const CompanyGetStatsResponseSchema = z.looseObject({
  totalCompanies: z.number().int().nonnegative(),
  activeCompanies: z.number().int().nonnegative(),
  archivedCompanies: z.number().int().nonnegative(),
  inactiveCompanies: z.number().int().nonnegative(),
});

export const CompanyLevelGetStatsResponseSchema = z.looseObject({
  activeChildCompanies: z.number().int().nonnegative(),
  activeSites: z.number().int().nonnegative(),
  archivedChildCompanies: z.number().int().nonnegative(),
  completedSites: z.number().int().nonnegative(),
  holdSites: z.number().int().nonnegative(),
  inactiveChildCompanies: z.number().int().nonnegative(),
  totalSites: z.number().int().nonnegative(),
  upcomingSites: z.number().int().nonnegative(),
});

export const CompanyGetResponseSchema = z.looseObject({
  records: z.array(
    CompanyGetBaseResponseSchema.extend({
      stats: CompanyLevelGetStatsResponseSchema.nullable(),
    }).loose()
  ),
  overallStats: CompanyGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
