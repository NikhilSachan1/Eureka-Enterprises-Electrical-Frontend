import { onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';

const SiteOverviewCompanySchema = z.looseObject({
  id: uuidField,
  name: z.string(),
});

const SiteOverviewSiteSchema = z.looseObject({
  name: z.string(),
  status: z.string(),
  city: z.string(),
  state: z.string(),
  managerName: z.string(),
  startDate: onlyDateStringField,
  endDate: onlyDateStringField,
  workTypes: z.array(z.string()),
  company: SiteOverviewCompanySchema.nullable(),
});

const SiteOverviewEmployeeSchema = z
  .looseObject({
    userId: uuidField,
  })
  .nullable();

const SiteOverviewContractorSchema = z
  .looseObject({
    id: uuidField,
    name: z.string(),
  })
  .nullable();

const SiteOverviewVendorSchema = z
  .looseObject({
    id: uuidField,
    name: z.string(),
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
