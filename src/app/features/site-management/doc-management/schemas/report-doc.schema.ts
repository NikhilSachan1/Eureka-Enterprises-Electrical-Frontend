import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const ReportDocAddRequestSchema = z
  .object({
    jmcNumber: z.string(),
    reportNumber: z.string(),
    reportDate: dateField,
    reportAttachments: z.array(fileField),
    reportRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      documentNumber: data.reportNumber,
      docReferenceNumber: data.jmcNumber,
      documentDate: transformDateFormat(data.reportDate),
      attachments: data.reportAttachments,
      note: data.reportRemark,
      documentType: EDocType.REPORT,
    };
  });

export const ReportDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
