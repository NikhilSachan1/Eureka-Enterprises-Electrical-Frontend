import { z } from 'zod';

export const UploadJmcSignedCopyRequestSchema = z
  .object({
    fileKey: z.string(),
    fileName: z.string(),
  })
  .strict();

export const UploadJmcSignedCopyResponseSchema = z.looseObject({
  message: z.string(),
});
