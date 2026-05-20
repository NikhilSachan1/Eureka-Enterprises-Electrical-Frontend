import z from 'zod';

export const MyFilesRenameRequestSchema = z
  .object({
    name: z.string().min(1),
  })
  .strip();

export const MyFilesRenameResponseSchema = z.looseObject({
  message: z.string(),
});
