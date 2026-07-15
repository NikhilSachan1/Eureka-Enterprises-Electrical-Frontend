import z from 'zod';

export const DeletePaymentSheetRequestSchema = z.object({}).strict();

export const DeletePaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
