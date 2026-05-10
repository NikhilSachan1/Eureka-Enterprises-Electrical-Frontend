import z from 'zod';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { JmcGetBaseResponseSchema } from './get-jmc.schema';

export const JmcDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const JmcDetailGetResponseSchema = z.looseObject({
  ...JmcGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  remarks: z.string().nullable(),
  approvalByUser: makeFieldsNullable(UserSchema).nullable(),
  approvalAt: isoDateTimeField.nullable(),
  approvalReason: z.string().nullable(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
