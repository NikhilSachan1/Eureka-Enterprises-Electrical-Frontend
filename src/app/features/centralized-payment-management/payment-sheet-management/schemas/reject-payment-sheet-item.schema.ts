import z from 'zod';

export const RejectPaymentSheetItemRequestSchema = z
  .object({
    remarks: z.string().trim().min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks.trim(),
  }));

export const RejectPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
