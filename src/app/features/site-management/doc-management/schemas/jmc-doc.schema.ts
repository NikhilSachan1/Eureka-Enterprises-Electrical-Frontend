import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const JmcDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    poNumber: z.string(),
    jmcNumber: z.string(),
    jmcDate: dateField,
    jmcAttachments: z.array(fileField),
    jmcRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      documentNumber: data.jmcNumber,
      docReferenceNumber: data.poNumber,
      documentDate: transformDateFormat(data.jmcDate),
      attachments: data.jmcAttachments,
      note: data.jmcRemark,
      documentType: EDocType.JMC,
      docContext: data.docContext,
    };
  });

export const JmcDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
