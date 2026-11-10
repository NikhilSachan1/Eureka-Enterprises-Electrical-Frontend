import * as z from 'zod';

export const SiteAllocationDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
