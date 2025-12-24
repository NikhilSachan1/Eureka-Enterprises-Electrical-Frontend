import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { employeeId } = EmployeeBaseSchema.shape;

export const EmployeeGetNextEmployeeIdResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      employeeId,
    }),
  })
  .strict();
