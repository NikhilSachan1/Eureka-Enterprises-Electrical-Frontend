import { z } from 'zod';
import { EmployeeDetailGetResponseSchema } from './get-employee-detail.schema';
import { EmployeeBaseSchema } from './base-employee.schema';

const { roles } = EmployeeBaseSchema.shape;

export const EmployeeChangeRoleRequestSchema = z
  .object({
    employeeRoles: z.array(roles.element.shape.name).min(1),
  })
  .strict()
  .transform(data => ({
    roles: data.employeeRoles,
  }));

export const EmployeeChangeRoleResponseSchema = EmployeeDetailGetResponseSchema;
