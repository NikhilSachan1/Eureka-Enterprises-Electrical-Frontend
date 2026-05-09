import { z } from 'zod';

export const UnlockGrantPoResponseSchema = z.looseObject({
  message: z.string(),
});
