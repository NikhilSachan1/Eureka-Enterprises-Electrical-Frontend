import { z } from 'zod';

export const JmcItemSuggestionsGetRequestSchema = z
  .object({
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(50),
  })
  .strict();

export const JmcItemSuggestionsGetResponseSchema = z.object({
  records: z.array(z.string()),
});
