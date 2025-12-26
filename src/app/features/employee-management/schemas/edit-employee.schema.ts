import { z } from 'zod';
import { EmployeeAddRequestSchema } from './add-employee.schema';

export const EmployeeEditRequestSchema = EmployeeAddRequestSchema.omit({
  roles: true,
  salary: true,
}).strict();

export const EmployeeEditResponseSchema = z.object({
  message: z.string(),
});
