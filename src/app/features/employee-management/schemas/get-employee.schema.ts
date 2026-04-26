import { AuditSchema, FilterSchema } from '@shared/schemas';
import z from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdAt, updatedAt } = AuditSchema.shape;

export const EmployeeGetRequestSchema = z
  .object({
    employeeRole: z.array(z.string()).optional(),
    employeeStatus: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ employeeRole: roleName, employeeStatus, ...rest }) => {
    return {
      ...rest,
      status: employeeStatus,
      role: roleName,
    };
  });

export const EmployeeGetBaseResponseSchema = EmployeeBaseSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  contactNumber: true,
  profilePicture: true,
  status: true,
  employeeId: true,
  dateOfJoining: true,
  employeeType: true,
  designation: true,
  roles: true,
})
  .extend({
    createdAt,
    updatedAt,
  })
  .loose()
  .transform(({ roles: employeeRoles, ...rest }) => {
    return {
      ...rest,
      roles: employeeRoles.map(role => role.name).join(', '),
    };
  });

export const EmployeeGetStatsResponseSchema = z.looseObject({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  newJoinersLast30Days: z.number().int().nonnegative(),
  totalPermissions: z.number().int().nonnegative(),
  byEmployeeType: z.record(
    z.string(),
    z.number().int().nonnegative().optional()
  ),
  byDesignation: z.record(
    z.string(),
    z.number().int().nonnegative().optional()
  ),
  byGender: z.record(z.string(), z.number().int().nonnegative().optional()),
});

export const EmployeeGetResponseSchema = z.looseObject({
  records: z.array(EmployeeGetBaseResponseSchema),
  metrics: EmployeeGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
