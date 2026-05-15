import z from 'zod';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { InvoiceGetBaseResponseSchema } from './get-invoice.schema';

export const InvoiceDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const InvoiceDetailGetResponseSchema = z.looseObject({
  ...InvoiceGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  approvalByUser: makeFieldsNullable(UserSchema).nullable(),
  approvalAt: isoDateTimeField.nullable(),
  approvalReason: z.string().nullable(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
