import { z } from 'zod';

export const VerifyTdsEntryResponseSchema = z.looseObject({
  message: z.string(),
});
