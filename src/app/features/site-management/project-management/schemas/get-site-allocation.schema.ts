import * as z from 'zod';
import {
  dateField,
  FilterSchema,
  isoDateTimeField,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const SiteAllocationGetRequestSchema = z
  .object({
    projectName: uuidField.optional(),
    employeeName: uuidField.optional(),
    /** Workspace date filter: allocations active on any day in this range. */
    dateRange: z.array(dateField).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, employeeName, dateRange, ...rest }) => {
    const [start, end] = dateRange ?? [];
    return {
      ...rest,
      siteId: projectName,
      userId: employeeName,
      periodFrom: start ? transformDateFormat(start) : undefined,
      periodTo: end ? transformDateFormat(end) : undefined,
      includeUser: true,
      includeSite: true,
    };
  });

const SiteAllocationSiteSchema = z.looseObject({
  name: z.string(),
  city: z.string(),
  state: z.string(),
});

const SiteAllocationUserSchema = EmployeeBaseSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  employeeId: true,
});

export const SiteAllocationGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  createdAt: isoDateTimeField,
  updatedAt: isoDateTimeField.nullable().optional(),
  allocatedAt: onlyDateStringField,
  deallocatedAt: onlyDateStringField.nullable(),
  isCurrentlyAllocated: z.boolean(),
  role: z.string().optional().nullable(),
  site: SiteAllocationSiteSchema,
  user: SiteAllocationUserSchema,
  createdByUser: UserSchema.nullable().optional(),
  updatedByUser: makeFieldsNullable(UserSchema).nullable().optional(),
});

export const SiteAllocationGetResponseSchema = z.looseObject({
  records: z.array(SiteAllocationGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
