import { z } from 'zod';
import {
  AuditSchema,
  FilterSchema,
  isoDateTimeField,
  uuidField,
} from '@shared/schemas';
import { ProjectBaseSchema } from './base-project.schema';
import { CompanyGetBaseResponseSchema } from '@features/site-management/company-management/schemas';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ProjectGetRequestSchema = z
  .object({
    companyNames: z.array(z.string()).optional(),
    contractorNames: z.array(z.string()).optional(),
    managerNames: z.array(z.string()).optional(),
    projectStatus: z.array(z.string()).optional(),
    projectCity: z.array(z.string()).optional(),
    projectState: z.array(z.string()).optional(),
    includeContractors: z.boolean().optional().default(true),
    includeCompany: z.boolean().optional().default(true),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      companyNames,
      contractorNames,
      managerNames,
      projectStatus,
      projectCity,
      projectState,
      ...rest
    }) => {
      return {
        ...rest,
        city: projectCity,
        state: projectState,
        status: projectStatus,
        companyId: companyNames,
        contractorId: contractorNames,
        managerIds: managerNames,
      };
    }
  );

export const ProjectGetBaseResponseSchema = ProjectBaseSchema.extend({
  ...AuditSchema.shape,
  company: CompanyGetBaseResponseSchema.pick({
    id: true,
    name: true,
    logo: true,
    fullAddress: true,
  }).nullable(),
  siteContractors: z
    .array(
      z.object({
        id: uuidField,
        siteId: uuidField,
        contractorId: uuidField,
      })
    )
    .nullable(),
  fullAddress: z.string().nullable(),
  allocatedEmployees: z
    .array(
      EmployeeBaseSchema.pick({
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
      }).extend({
        role: z.string(),
        allocationType: z.string(),
        allocationId: uuidField.optional(),
        allocatedAt: isoDateTimeField.optional(),
      })
    )
    .nullable(),

  allocatedEmployeeCount: z.number().int().nonnegative().nullable(),
}).strict();

export const ProjectGetStatsResponseSchema = z
  .object({
    totalSites: z.number().int().nonnegative(),
    upcomingSites: z.number().int().nonnegative(),
    ongoingSites: z.number().int().nonnegative(),
    holdSites: z.number().int().nonnegative(),
    completedSites: z.number().int().nonnegative(),
    inactiveSites: z.number().int().nonnegative(),
    activeSites: z.number().int().nonnegative(),
  })
  .strict();

export const ProjectGetResponseSchema = z
  .object({
    records: z.array(
      ProjectGetBaseResponseSchema.extend({
        healthScore: z.number().int().nonnegative(),
        healthGrade: z.string(),
      })
    ),
    stats: ProjectGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
