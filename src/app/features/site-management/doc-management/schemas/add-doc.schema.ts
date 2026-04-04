import { z } from 'zod';
import { DocUpsertShapeSchema } from './base-doc.schema';
import { transformDateFormat } from '@shared/utility';

export const DocAddRequestSchema = DocUpsertShapeSchema.strict().transform(
  data => {
    return {
      siteId: data.projectName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentDate: transformDateFormat(data.documentDate),
      amount: data.amount,
      siteDocumentFiles: data.documentAttachments,
      remarks: data.remarks,
    };
  }
);

export const DocAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .loose();
