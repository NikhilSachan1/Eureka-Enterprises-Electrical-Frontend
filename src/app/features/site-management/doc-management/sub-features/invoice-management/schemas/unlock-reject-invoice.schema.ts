import { z } from 'zod';

export const UnlockRejectInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
