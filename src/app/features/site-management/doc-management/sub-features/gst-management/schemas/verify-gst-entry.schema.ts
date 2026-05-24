import z from 'zod';

export const VerifyGstEntryRequestSchema = z
  .object({
    remarks: z.string().nullable(),
    fileKey: z.string().nullable(),
    fileName: z.string().nullable(),
  })
  .strict();

export const VerifyGstEntryResponseSchema = z.looseObject({
  message: z.string(),
});
