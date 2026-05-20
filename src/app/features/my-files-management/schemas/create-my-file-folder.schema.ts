import { uuidField } from '@shared/schemas';
import z from 'zod';

export const MyFilesCreateFolderRequestSchema = z
  .object({
    name: z.string().min(1),
    parentId: uuidField.nullable(),
  })
  .strict();

export const MyFilesCreateFolderResponseSchema = z.looseObject({
  message: z.string(),
});
