import { z } from 'zod';

export const DocDeleteResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
