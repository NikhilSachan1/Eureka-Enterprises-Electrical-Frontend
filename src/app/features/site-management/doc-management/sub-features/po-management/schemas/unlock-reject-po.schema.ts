import * as z from 'zod';

export const UnlockRejectPoResponseSchema = z.looseObject({
  message: z.string(),
});
