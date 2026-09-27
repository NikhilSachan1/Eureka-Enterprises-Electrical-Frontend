import { z } from 'zod';

export const ALL_INVOICE_ADVANCE_SETTLEMENTS = '__all__';

export const UnsettleAdvanceInvoiceFormSchema = z
  .object({
    settlementId: z.string().trim().min(1),
  })
  .strict();

export const UnsettleAdvanceInvoiceResponseSchema = z.looseObject({
  message: z.string(),
  releasedAmount: z.union([z.string(), z.number()]).optional(),
});
