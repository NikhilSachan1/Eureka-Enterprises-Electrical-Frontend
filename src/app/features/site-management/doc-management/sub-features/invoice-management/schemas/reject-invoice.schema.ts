import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';

export const RejectInvoiceRequestSchema = InvoiceUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const RejectInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
