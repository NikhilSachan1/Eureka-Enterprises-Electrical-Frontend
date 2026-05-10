import z from 'zod';

export const AttachmentsGetRequestSchema = z.object({
  key: z.string(),
});

export const AttachmentsGetResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});

export const FinancialFileUploadResponseSchema = z.looseObject({
  fileKey: z.string(),
  fileName: z.string(),
});
