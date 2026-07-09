import { z } from 'zod';

export const UnlockRejectBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
