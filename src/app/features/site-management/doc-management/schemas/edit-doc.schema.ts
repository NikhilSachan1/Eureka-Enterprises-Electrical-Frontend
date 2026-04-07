import { z } from 'zod';
import { DocUpsertShapeSchema } from './base-doc.schema';

export const DocEditRequestSchema = DocUpsertShapeSchema.omit({
  projectName: true,
})
  .strict()
  .transform(data => {
    return {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentDate: data.documentDate,
      amount: data.amount,
      siteDocumentFiles: data.documentAttachments,
      remarks: data.remarks,
    };
  });

export const DocEditResponseSchema = z.looseObject({
  message: z.string(),
});
