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
  paidFromAccount: z
    .looseObject({
      accountHolderName: z.string().nullable(),
      bankName: z.string().nullable(),
      accountNumber: z.string().nullable(),
      ifscCode: z.string().nullable(),
      branchName: z.string().nullable(),
    })
    .nullable()
    .optional(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
});
