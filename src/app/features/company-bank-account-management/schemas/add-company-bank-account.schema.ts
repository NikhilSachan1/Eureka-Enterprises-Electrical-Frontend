import { z } from 'zod';
import { CompanyBankAccountUpsertShapeSchema } from './base-company-bank-account.schema';

export const CompanyBankAccountAddRequestSchema =
  CompanyBankAccountUpsertShapeSchema.strict().transform(data => ({
    bankName: data.bankName,
    accountHolderName: data.accountHolderName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
    branchName: data.branchName,
    accountName: 'XXXXX',
  }));

export const CompanyBankAccountAddResponseSchema = z.looseObject({
  message: z.string(),
});
