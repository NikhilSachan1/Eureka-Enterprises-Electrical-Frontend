import { FilterSchema } from '@shared/schemas';
import z from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';
import {
  DESIGNATION_DATA,
  EMPLOYEE_GENDER_DATA,
  EMPLOYMENT_TYPE_DATA,
} from '@shared/config/static-data.config';

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
  .transform(({ employeeRole: roleName, ...rest }) => {
    return {
      ...rest,
      role: roleName,
    };
  });

export const EmployeeGetBaseResponseSchema = EmployeeBaseSchema;

export const EmployeeGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    inactive: z.number().int().nonnegative(),
    newJoinersLast30Days: z.number().int().nonnegative(),
    byEmployeeType: z.record(
      z.enum(
        EMPLOYMENT_TYPE_DATA.map(item => item.value) as [string, ...string[]]
      ),
      z.number().int().nonnegative().optional()
    ),
    byDesignation: z.record(
      z.enum(DESIGNATION_DATA.map(item => item.value) as [string, ...string[]]),
      z.number().int().nonnegative().optional()
    ),
    byGender: z.record(
      z.enum(
        EMPLOYEE_GENDER_DATA.map(item => item.value) as [string, ...string[]]
      ),
      z.number().int().nonnegative().optional()
    ),
  })
  .strict();

export const EmployeeGetResponseSchema = z
  .object({
    records: z.array(EmployeeGetBaseResponseSchema),
    metrics: EmployeeGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
