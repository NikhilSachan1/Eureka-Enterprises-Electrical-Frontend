import z from 'zod';

export const ForwardPaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
});
