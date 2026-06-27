import z from 'zod';

export const SubmitPaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
