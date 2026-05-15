import { z } from 'zod';

export const DeleteInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
