import z from 'zod';

export const UpdatePaymentSheetItemRequestSchema = z
  .object({
    amount: z.number(),
    reason: z.string().trim().nullable(),
  })
  .strict();

export const UpdatePaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
