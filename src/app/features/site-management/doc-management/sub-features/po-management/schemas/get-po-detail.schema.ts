import z from 'zod';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { PoGetBaseResponseSchema } from './get-po.schema';

export const PoDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const PoDetailGetResponseSchema = z.looseObject({
  ...PoGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  remarks: z.string().nullable(),
  approvalByUser: makeFieldsNullable(UserSchema).nullable(),
  approvalAt: isoDateTimeField.nullable(),
  approvalReason: z.string().nullable(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
