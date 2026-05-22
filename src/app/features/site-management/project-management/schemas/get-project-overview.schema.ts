import { uuidField } from '@shared/schemas';
import { z } from 'zod';

const SiteOverviewCompanySchema = z.looseObject({
  id: uuidField,
});

const SiteOverviewSiteSchema = z.looseObject({
  company: SiteOverviewCompanySchema.nullable(),
  workTypes: z.array(z.string()),
});

const SiteOverviewEmployeeSchema = z
  .looseObject({
    userId: uuidField,
  })
  .nullable();

const SiteOverviewContractorSchema = z
  .looseObject({
    id: uuidField,
  })
  .nullable();

const SiteOverviewVendorSchema = z
  .looseObject({
    id: uuidField,
  })
  .nullable();

export const ProjectOverviewGetResponseSchema = z.looseObject({
  site: SiteOverviewSiteSchema,
  employees: z.looseObject({
    allocated: z.array(SiteOverviewEmployeeSchema),
    deallocated: z.array(SiteOverviewEmployeeSchema),
  }),
  contractors: z.array(SiteOverviewContractorSchema),
  vendors: z.array(SiteOverviewVendorSchema),
});
