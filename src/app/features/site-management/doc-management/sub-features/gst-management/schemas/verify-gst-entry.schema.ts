import { z } from 'zod';

export const VerifyGstEntryResponseSchema = z.looseObject({
  message: z.string(),
});
