import { z } from 'zod';

export const PoDefaultTermsGetResponseSchema = z.object({
  content: z.string(),
});
