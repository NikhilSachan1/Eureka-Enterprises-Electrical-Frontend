import * as z from 'zod';

export const UnlockGrantInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
