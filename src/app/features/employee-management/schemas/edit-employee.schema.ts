import { z } from 'zod';
import { EmployeeAddRequestSchema } from './add-employee.schema';
import { EmployeeBaseSchema } from './base-employee.schema';
import { AuditSchema, isoDateTimeField } from '@shared/schemas';

export const EmployeeEditRequestSchema = EmployeeAddRequestSchema.omit({
  roles: true,
  salary: true,
}).strict();

export const EmployeeEditResponseSchema = EmployeeBaseSchema.omit({
  roles: true,
})
  .extend({
    ...AuditSchema.shape,
    password: z.string(), //ToDo remove this field
    passwordUpdatedAt: isoDateTimeField.nullable(), //ToDo remove this field
    timezone: z.string(),
  })
  .strict();
