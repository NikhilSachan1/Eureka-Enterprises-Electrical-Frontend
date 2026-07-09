import z from 'zod';

export const DownloadPaymentSheetPdfFormSchema = z
  .object({
    sourceType: z.string(),
  })
  .strict();
