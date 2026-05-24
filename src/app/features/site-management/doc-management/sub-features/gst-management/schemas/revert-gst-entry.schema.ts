import { z } from 'zod';

export const RevertGstEntryResponseSchema = z.looseObject({
  message: z.string(),
});
