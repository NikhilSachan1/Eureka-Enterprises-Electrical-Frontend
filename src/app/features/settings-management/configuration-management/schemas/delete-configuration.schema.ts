import * as z from 'zod';

export const ConfigurationDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
