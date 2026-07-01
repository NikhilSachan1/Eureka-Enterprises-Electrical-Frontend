import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { BookPaymentGetBaseResponseSchema } from './get-book-payment.schema';

export const BookPaymentDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const BookPaymentDetailGetResponseSchema = z.looseObject({
  ...BookPaymentGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
