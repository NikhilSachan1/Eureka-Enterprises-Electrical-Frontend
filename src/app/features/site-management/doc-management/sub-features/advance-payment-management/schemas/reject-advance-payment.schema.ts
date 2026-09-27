import { z } from 'zod';

export const RejectAdvancePaymentRequestSchema = z
  .object({
    remarks: z.string().min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks.trim(),
  }));

export const RejectAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
});
