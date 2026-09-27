import { z } from 'zod';

export const DeleteAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
});
