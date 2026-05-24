import z from 'zod';

export const RevertGstEntryRequestSchema = z
  .object({
    remarks: z.string(),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks ?? null,
  }));

export const RevertGstEntryResponseSchema = z.looseObject({
  message: z.string(),
});
