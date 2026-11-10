import * as z from 'zod';

export const DeletePoResponseSchema = z.looseObject({
  message: z.string(),
});
