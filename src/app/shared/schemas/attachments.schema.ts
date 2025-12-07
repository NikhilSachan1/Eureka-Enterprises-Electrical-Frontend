import z from 'zod';

export const AttachmentsGetRequestSchema = z.object({
  key: z.string(),
});

export const AttachmentsGetResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});
