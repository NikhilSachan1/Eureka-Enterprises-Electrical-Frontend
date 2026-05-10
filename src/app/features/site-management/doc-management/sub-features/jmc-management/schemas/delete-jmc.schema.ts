import { z } from 'zod';

export const DeleteJmcResponseSchema = z.looseObject({
  message: z.string(),
});
