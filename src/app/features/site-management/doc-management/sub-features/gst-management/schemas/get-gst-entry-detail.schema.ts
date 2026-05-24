import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { GstEntryGetBaseResponseSchema } from './get-gst-entry.schema';

export const GstEntryDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const GstEntryDetailGetResponseSchema = z.looseObject({
  ...GstEntryGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  verifiedByUser: makeFieldsNullable(UserSchema).nullable(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
