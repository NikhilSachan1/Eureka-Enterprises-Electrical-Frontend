import { z } from 'zod';
import { CompanyBankAccountEditResponseSchema } from './edit-company-bank-account.schema';

export const CompanyBankAccountChangeStatusRequestSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const CompanyBankAccountChangeStatusResponseSchema =
  CompanyBankAccountEditResponseSchema;
