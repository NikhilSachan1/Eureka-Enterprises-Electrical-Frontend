import { z } from 'zod';
import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';

const { sortOrder, pageSize, page } = FilterSchema.shape;

export const WorkforceAllocationGetRequestSchema = z
  .object({
    search: z.string().trim().optional(),
    projectName: uuidField.optional(),
    allocatedStatus: z.enum(['FREE', 'ALLOCATED']).optional(),
    sortField: z.string().optional(),
    sortOrder,
    pageSize,
    page,
  })
  .strict()
  .transform(
    ({ projectName, allocatedStatus, sortField: _sortField, ...rest }) => ({
      siteId: projectName,
      allocatedStatus,
      ...rest,
    })
  );

const WorkforceCompanyRefSchema = z
  .looseObject({
    id: uuidField,
    name: z.string(),
    city: z.string(),
    state: z.string(),
  })
  .nullable();

export const WorkforceAllocationCurrentProjectSchema = z.looseObject({
  siteId: uuidField,
  siteName: z.string(),
  city: z.string(),
  state: z.string(),
  startDate: isoDateTimeField,
  endDate: isoDateTimeField,
  company: WorkforceCompanyRefSchema,
  since: isoDateTimeField,
  allocationId: uuidField,
});

export const WorkforceAllocationGetBaseResponseSchema = z.looseObject({
  userId: uuidField,
  employeeName: z.string(),
  employeeCode: z.string(),
  status: z.enum(['ALLOCATED', 'FREE']),
  currentProject: WorkforceAllocationCurrentProjectSchema.nullable(),
});

export const WorkforceAllocationGetStatsSchema = z.looseObject({
  total: z.number().int().nonnegative(),
  allocated: z.number().int().nonnegative(),
  free: z.number().int().nonnegative(),
});

export const WorkforceAllocationGetResponseSchema = z.looseObject({
  stats: WorkforceAllocationGetStatsSchema,
  records: z.array(WorkforceAllocationGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
