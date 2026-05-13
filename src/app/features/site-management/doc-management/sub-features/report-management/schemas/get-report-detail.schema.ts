import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { ReportGetBaseResponseSchema } from './get-report.schema';

export const ReportDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const ReportDetailGetResponseSchema = z.looseObject({
  ...ReportGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
