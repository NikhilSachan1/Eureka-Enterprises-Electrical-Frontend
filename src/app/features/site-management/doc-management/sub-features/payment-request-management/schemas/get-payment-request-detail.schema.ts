import z from 'zod';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { PaymentRequestGetBaseResponseSchema } from './get-payment-request.schema';

export const PaymentRequestDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

const { createdAt, updatedAt } = AuditSchema.shape;

export const PaymentRequestDetailGetResponseSchema = z.looseObject({
  ...PaymentRequestGetBaseResponseSchema.shape,
  createdAt,
  updatedAt,
  remarks: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  approvalByUser: makeFieldsNullable(UserSchema).nullable().optional(),
  approvalAt: isoDateTimeField.nullable().optional(),
  createdByUser: UserSchema.optional(),
  updatedByUser: makeFieldsNullable(UserSchema).nullable().optional(),
});
