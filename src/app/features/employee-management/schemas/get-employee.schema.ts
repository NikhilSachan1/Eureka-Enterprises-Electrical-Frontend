import { FilterSchema } from '@shared/schemas';
import z from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { role } = EmployeeBaseSchema.shape;

export const EmployeeGetRequestSchema = z
  .object({
    employeeRole: z.array(role.shape.name).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  //TODO: when multiple roles are implemented remove the transform
  .transform(({ employeeRole: roleName, ...rest }) => {
    return {
      ...rest,
      role: roleName?.[0],
    };
  });

export const EmployeeGetBaseResponseSchema = EmployeeBaseSchema;

export const EmployeeGetStatsResponseSchema = z
  .object({
    totalEmployees: z.number().int().nonnegative(),
    activeEmployees: z.number().int().nonnegative(),
    inactiveEmployees: z.number().int().nonnegative(),
  })
  .strict();

export const EmployeeGetResponseSchema = z
  .object({
    records: z.array(EmployeeGetBaseResponseSchema),
    stats: EmployeeGetStatsResponseSchema.strict().optional(), // TODO: when stats are implemented remove the optional
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
