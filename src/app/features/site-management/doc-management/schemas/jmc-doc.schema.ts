import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

export const JmcDocAddRequestSchema = z
  .object({
    poNumber: z.string(),
    jmcNumber: z.string(),
    jmcDate: dateField,
    jmcAttachments: z.array(fileField),
    jmcRemark: z.string(),
  })
  .strict();

export const JmcDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
