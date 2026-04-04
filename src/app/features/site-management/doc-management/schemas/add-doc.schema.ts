import { z } from 'zod';
import { DocUpsertShapeSchema } from './base-doc.schema';

export const DocAddRequestSchema = DocUpsertShapeSchema.strict().transform(
  data => {
    return {
      siteId: data.projectName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentDate: data.documentDate,
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
  .strict();
