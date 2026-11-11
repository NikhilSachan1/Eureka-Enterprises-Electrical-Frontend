import * as z from 'zod';

export const DeleteAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
});
