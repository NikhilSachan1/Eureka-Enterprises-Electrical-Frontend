import * as z from 'zod';

export const CompanyBankAccountDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
