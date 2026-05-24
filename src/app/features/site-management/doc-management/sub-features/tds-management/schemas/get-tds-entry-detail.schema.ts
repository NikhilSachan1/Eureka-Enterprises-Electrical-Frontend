import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { TdsEntryGetBaseResponseSchema } from './get-tds-entry.schema';

export const TdsEntryDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const TdsEntryDetailGetResponseSchema = z.looseObject({
  ...TdsEntryGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  verifiedByUser: makeFieldsNullable(UserSchema).nullable(),
  verifyRemarks: z.string().nullable(),
  revertReason: z.string().nullable(),
});
