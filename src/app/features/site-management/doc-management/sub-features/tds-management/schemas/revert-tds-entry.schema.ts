import z from 'zod';

export const RevertTdsEntryRequestSchema = z
  .object({
    remarks: z.string(),
  })
  .strict();

export const RevertTdsEntryResponseSchema = z.looseObject({
  message: z.string(),
});
