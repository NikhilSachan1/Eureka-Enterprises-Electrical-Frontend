import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';

export const ApproveInvoiceRequestSchema = InvoiceUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const ApproveInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
