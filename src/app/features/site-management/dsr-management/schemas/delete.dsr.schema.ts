import { z } from 'zod';

export const DsrDeleteResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
