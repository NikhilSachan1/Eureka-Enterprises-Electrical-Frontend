import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

export const PoDocAddRequestSchema = z
  .object({
    contractorName: z.string(),
    poNumber: z.string(),
    poDate: dateField,
    poTaxableAmount: z.number(),
    poGstAmount: z.number(),
    poTotalAmount: z.number(),
    poAttachments: z.array(fileField),
    poRemark: z.string(),
  })
  .strict();

export const PoDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
