import z from 'zod';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { BankTransferGetBaseResponseSchema } from './get-bank-transfer.schema';

export const BankTransferDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const BankTransferDetailGetResponseSchema = z.looseObject({
  ...BankTransferGetBaseResponseSchema.shape,
  ...AuditSchema.shape,
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
