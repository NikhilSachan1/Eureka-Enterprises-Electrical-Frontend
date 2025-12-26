import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

export const EmployeeChangeStatusRequestSchema = EmployeeBaseSchema.pick({
  status: true,
}).strict();

export const EmployeeChangeStatusResponseSchema = z.object({
  message: z.string(),
});
