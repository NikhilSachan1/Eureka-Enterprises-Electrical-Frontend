import { z } from 'zod';

export const DeleteBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
