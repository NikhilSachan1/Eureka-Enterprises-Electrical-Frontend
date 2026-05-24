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
  verifyRemarks: z.string().nullable(),
  revertReason: z.string().nullable(),
});
