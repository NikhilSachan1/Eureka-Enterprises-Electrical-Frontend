import { z } from 'zod';

export const SiteAllocationDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
