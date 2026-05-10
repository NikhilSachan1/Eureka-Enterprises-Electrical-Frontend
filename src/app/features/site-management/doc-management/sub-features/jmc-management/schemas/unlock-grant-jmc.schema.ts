import { z } from 'zod';

export const UnlockGrantJmcResponseSchema = z.looseObject({
  message: z.string(),
});
