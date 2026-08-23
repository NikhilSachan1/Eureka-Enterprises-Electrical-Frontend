import { z } from 'zod';

export const DeletePaymentRequestResponseSchema = z.looseObject({
  message: z.string(),
});
