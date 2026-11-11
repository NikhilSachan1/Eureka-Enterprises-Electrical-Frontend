import * as z from 'zod';

export const MyFilesDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
