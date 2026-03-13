import { z } from 'zod';

export const SiteDocumentDeleteResponseSchema = z
  .object({
    message: z.string().optional(),
  })
  .passthrough();
