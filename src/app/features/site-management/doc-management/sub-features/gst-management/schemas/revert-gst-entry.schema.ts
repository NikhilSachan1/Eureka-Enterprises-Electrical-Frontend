import z from 'zod';

export const RevertGstEntryRequestSchema = z
  .object({
    remarks: z.string(),
  })
  .strict();

export const RevertGstEntryResponseSchema = z.looseObject({
  message: z.string(),
});
