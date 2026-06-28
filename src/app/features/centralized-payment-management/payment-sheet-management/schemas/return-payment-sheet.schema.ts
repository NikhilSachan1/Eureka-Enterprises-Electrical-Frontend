import z from 'zod';

export const ReturnPaymentSheetRequestSchema = z
  .object({
    remarks: z.string().trim().min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks.trim(),
  }));

export const ReturnPaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
