import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';

export const UnlockRequestInvoiceRequestSchema = InvoiceUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const UnlockRequestInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
