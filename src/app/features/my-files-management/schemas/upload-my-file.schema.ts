import { fileField, uuidField } from '@shared/schemas';
import z from 'zod';

export const MyFilesUploadRequestSchema = z
  .object({
    files: z.array(fileField).min(1),
    parentId: uuidField.nullable().optional(),
  })
  .strict()
  .transform(data => ({
    orgFiles: data.files,
    parentId: data.parentId ?? null,
  }));

export const MyFilesUploadResponseSchema = z.looseObject({
  message: z.string(),
});
