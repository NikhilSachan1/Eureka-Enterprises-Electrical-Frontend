import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

export const ReportDocAddRequestSchema = z
  .object({
    jmcNumber: z.string(),
    reportNumber: z.string(),
    reportDate: dateField,
    reportAttachments: z.array(fileField),
    reportRemark: z.string(),
  })
  .strict();

export const ReportDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
