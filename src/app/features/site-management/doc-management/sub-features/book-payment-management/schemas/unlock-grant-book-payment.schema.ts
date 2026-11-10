import * as z from 'zod';

export const UnlockGrantBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
