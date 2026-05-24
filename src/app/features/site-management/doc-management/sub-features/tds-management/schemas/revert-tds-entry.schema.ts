import { z } from 'zod';

export const RevertTdsEntryResponseSchema = z.looseObject({
  message: z.string(),
});
