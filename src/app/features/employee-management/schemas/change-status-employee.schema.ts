import { z } from 'zod';
import { EmployeeDetailGetResponseSchema } from './get-employee-detail.schema';

export const EmployeeChangeStatusRequestSchema = z
  .object({
    employeeStatus: z.string().min(1),
  })
  .strict()
  .transform(data => ({
    status: data.employeeStatus,
  }));

export const EmployeeChangeStatusResponseSchema =
  EmployeeDetailGetResponseSchema;
