import * as z from 'zod';

export const DsrDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
