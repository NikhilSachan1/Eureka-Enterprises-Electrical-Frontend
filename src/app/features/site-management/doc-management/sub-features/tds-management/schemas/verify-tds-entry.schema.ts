import z from 'zod';

export const VerifyTdsEntryRequestSchema = z
  .object({
    remarks: z.string().nullable(),
    fileKey: z.string().nullable(),
    fileName: z.string().nullable(),
  })
  .strict();

export const VerifyTdsEntryResponseSchema = z.looseObject({
  message: z.string(),
});
