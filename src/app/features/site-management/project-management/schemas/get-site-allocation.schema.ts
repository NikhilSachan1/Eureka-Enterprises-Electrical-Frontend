import { z } from 'zod';
import {
  FilterSchema,
  isoDateTimeField,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import { makeFieldsNullable } from '@shared/utility';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const SiteAllocationGetRequestSchema = z
  .object({
    projectName: uuidField.optional(),
    employeeName: uuidField.optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, employeeName, ...rest }) => ({
    ...rest,
    siteId: projectName,
    userId: employeeName,
    includeUser: true,
    includeSite: true,
  }));

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
