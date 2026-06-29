import z from 'zod';

export const DeletePaymentSheetItemRequestSchema = z
  .object({
    reason: z.string().trim().nullable(),
  })
  .strict();

export const DeletePaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
