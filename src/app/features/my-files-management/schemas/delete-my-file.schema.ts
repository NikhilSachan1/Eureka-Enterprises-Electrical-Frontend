import z from 'zod';

export const MyFilesDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
