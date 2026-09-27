import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { AdvancePaymentGetBaseResponseSchema } from './get-advance-payment.schema';

export const AdvancePaymentDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

const { updatedAt } = AuditSchema.shape;

export const AdvancePaymentDetailGetResponseSchema = z.looseObject({
  ...AdvancePaymentGetBaseResponseSchema.shape,
  updatedAt: updatedAt.optional(),
  updatedByUser: makeFieldsNullable(UserSchema).nullable().optional(),
});
