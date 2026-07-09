import { z } from 'zod';
import { CompanyBankAccountUpsertShapeSchema } from './base-company-bank-account.schema';

export const CompanyBankAccountEditRequestSchema =
  CompanyBankAccountUpsertShapeSchema;

export const CompanyBankAccountEditResponseSchema = z.looseObject({
  message: z.string(),
});
