import { z } from 'zod';

export const UnlockRejectJmcResponseSchema = z.looseObject({
  message: z.string(),
});
