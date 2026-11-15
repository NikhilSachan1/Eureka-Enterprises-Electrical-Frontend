import * as z from 'zod';
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
  /** Who verified / released / recorded the challan, oldest first. */
  auditTrail: z
    .array(
      z.looseObject({
        action: z.string(),
        user: makeFieldsNullable(UserSchema).nullable(),
        date: z.string().nullable(),
        notes: z.string().nullable().optional(),
      })
    )
    .default([]),
});
