import z from 'zod';

export const RejectPaymentSheetRequestSchema = z
  .object({
    remarks: z.string().trim().min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks.trim(),
  }));

export const RejectPaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
