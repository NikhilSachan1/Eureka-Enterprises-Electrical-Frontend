import z from 'zod';

export const RevertTdsEntryRequestSchema = z
  .object({
    remarks: z.string(),
  })
  .strict()
  .transform(data => ({
    reason: data.remarks ?? null,
  }));

export const RevertTdsEntryResponseSchema = z.looseObject({
  message: z.string(),
});
