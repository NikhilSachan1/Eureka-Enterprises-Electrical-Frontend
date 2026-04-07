import { z } from 'zod';

export const DocDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
