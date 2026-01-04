import { EmployeeAddRequestSchema } from './add-employee.schema';
import { EmployeeDetailGetResponseSchema } from './get-employee-detail.schema';

export const EmployeeEditRequestSchema = EmployeeAddRequestSchema.omit({
  roles: true,
  salary: true,
}).strict();

export const EmployeeEditResponseSchema = EmployeeDetailGetResponseSchema;
