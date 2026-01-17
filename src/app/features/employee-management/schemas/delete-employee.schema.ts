import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { id } = EmployeeBaseSchema.shape;

export const EmployeeDeleteRequestSchema = z
  .object({
    employeeIds: z.array(id).min(1),
  })
  .strict()
  .transform(data => ({
    userIds: data.employeeIds,
  }));

export const EmployeeDeleteResultSchema = z
  .object({
    userId: id,
    message: z.string(),
  })
  .strict();

export const EmployeeDeleteErrorSchema = z
  .object({
    userId: id,
    error: z.string().min(1),
  })
  .strict();

export const EmployeeDeleteResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(EmployeeDeleteResultSchema),
    errors: z.array(EmployeeDeleteErrorSchema),
  })
  .strict();
