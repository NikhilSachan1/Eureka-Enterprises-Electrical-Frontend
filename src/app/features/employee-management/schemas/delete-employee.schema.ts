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

export const EmployeeDeleteResultSchema = z.looseObject({
  userId: id,
  message: z.string(),
});

export const EmployeeDeleteErrorSchema = z.looseObject({
  userId: id,
  error: z.string().min(1),
});

export const EmployeeDeleteResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(EmployeeDeleteResultSchema),
  errors: z.array(EmployeeDeleteErrorSchema),
});
