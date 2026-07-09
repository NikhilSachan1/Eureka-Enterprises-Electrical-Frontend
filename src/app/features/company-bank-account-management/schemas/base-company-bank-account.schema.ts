import { uuidField } from '@shared/schemas';
import z from 'zod';

export const CompanyBankAccountBaseSchema = z.looseObject({
  id: uuidField,
  accountHolderName: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  ifscCode: z.string().min(1),
  branchName: z.string().nullable(),
  isActive: z.boolean(),
});

export const CompanyBankAccountUpsertShapeSchema = z
  .object({
    bankName: z.string().min(1),
    accountHolderName: z.string().min(1),
    accountNumber: z.string().min(1),
    ifscCode: z.string().min(1),
    branchName: z.string().min(1),
  })
  .strict();
