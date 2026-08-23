import { z } from 'zod';

export const RejectPaymentRequestRequestSchema = z
  .object({
    remarks: z.string().min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks.trim(),
  }));

export const RejectPaymentRequestResponseSchema = z.looseObject({
  message: z.string(),
});
