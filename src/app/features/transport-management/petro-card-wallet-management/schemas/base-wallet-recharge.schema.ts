import { dateField, uuidField } from '@shared/schemas';
import z from 'zod';

export const WalletRechargeStatusSchema = z.enum(['PENDING', 'PAID']);

export const WalletRechargeBaseSchema = z.looseObject({
  id: uuidField,
  amount: z.coerce.number(),
  status: WalletRechargeStatusSchema.optional(),
  editable: z.boolean().optional(),
  rechargeDate: z.string(),
  referenceNumber: z.string().nullable().optional(),
  paymentMode: z.string().nullable().optional(),
  paidFromAccountId: uuidField.nullable(),
  paidFromAccount: z
    .looseObject({
      id: uuidField,
      accountName: z.string().nullable().optional(),
      accountHolderName: z.string().nullable().optional(),
      bankName: z.string().nullable().optional(),
      accountNumber: z.string().nullable().optional(),
      ifscCode: z.string().nullable().optional(),
      branchName: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  remarks: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export const WalletRechargeUpsertShapeSchema = z
  .object({
    amount: z.coerce.number().positive(),
    rechargeDate: dateField,
  })
  .strict();
