import { z } from 'zod';

export const PoItemSuggestionsGetRequestSchema = z
  .object({
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(50),
  })
  .strict();

export const PoItemSuggestionRecordSchema = z.looseObject({
  name: z.string(),
});

export const PoItemSuggestionsGetResponseSchema = z.object({
  records: z.array(PoItemSuggestionRecordSchema),
});
