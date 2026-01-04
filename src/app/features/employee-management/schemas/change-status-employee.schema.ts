import { EmployeeBaseSchema } from './base-employee.schema';
import { EmployeeDetailGetResponseSchema } from './get-employee-detail.schema';

export const EmployeeChangeStatusRequestSchema = EmployeeBaseSchema.pick({
  status: true,
}).strict();

export const EmployeeChangeStatusResponseSchema =
  EmployeeDetailGetResponseSchema;
