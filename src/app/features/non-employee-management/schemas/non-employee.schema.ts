import { fileField, uuidField } from '@shared/schemas';
import { z } from 'zod';

/**
 * A non-employee only logs in and works: no employee code, salary, leave or payroll. Everything
 * beyond name, email and roles can be empty, so the employee schemas cannot validate these records.
 */
export const NonEmployeeBaseResponseSchema = z.looseObject({
  id: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  contactNumber: z.string().nullable(),
  profilePicture: z.string().nullable(),
  status: z.string().min(1),
  roles: z.array(z.object({ name: z.string().min(1) })),
});

export const NonEmployeeGetResponseSchema = z.looseObject({
  records: z.array(NonEmployeeBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});

const optionalFirstFile = z
  .array(fileField)
  .nullable()
  .optional()
  .transform(files => files?.[0]);

const NonEmployeeFormShapeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().min(1),
  contactNumber: z.string().min(1),
  profilePicture: optionalFirstFile,
});

export const NonEmployeeAddRequestSchema = NonEmployeeFormShapeSchema.extend({
  roles: z.array(z.string().min(1)).min(1),
}).strict();

export const NonEmployeeAddResponseSchema = z.looseObject({
  id: uuidField,
  message: z.string(),
});

export const NonEmployeeEditRequestSchema =
  NonEmployeeFormShapeSchema.strict();

export const NonEmployeeDeleteResponseSchema = z.looseObject({
  message: z.string(),
});

export type INonEmployeeGetBaseResponseDto = z.infer<
  typeof NonEmployeeBaseResponseSchema
>;
export type INonEmployeeGetResponseDto = z.infer<
  typeof NonEmployeeGetResponseSchema
>;
export type INonEmployeeAddFormDto = z.input<
  typeof NonEmployeeAddRequestSchema
>;
export type INonEmployeeEditFormDto = z.input<
  typeof NonEmployeeEditRequestSchema
>;
export type INonEmployeeAddResponseDto = z.infer<
  typeof NonEmployeeAddResponseSchema
>;
export type INonEmployeeDeleteResponseDto = z.infer<
  typeof NonEmployeeDeleteResponseSchema
>;
