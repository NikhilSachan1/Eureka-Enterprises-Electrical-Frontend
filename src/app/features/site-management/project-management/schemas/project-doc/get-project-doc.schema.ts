import { z } from 'zod';

/** List params - permissive */
export const SiteDocumentGetRequestSchema = z
  .object({
    siteId: z.string().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    sortField: z.string().optional(),
    sortOrder: z.string().optional(),
  })
  .passthrough();

const SiteDocumentRecordSchemaInner = z
  .object({
    id: z.string(),
    documentNumber: z.string().optional(),
    documentType: z.string().optional(),
    documentDate: z.string().optional(),
    dueDate: z.string().optional(),
    amount: z.number().optional(),
    gstAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    remarks: z.string().optional(),
    siteId: z.string().optional(),
    contractorId: z.string().optional(),
    files: z
      .array(z.object({ fileKey: z.string().optional() }).passthrough())
      .optional(),
    documentKeys: z.array(z.string()).optional(),
  })
  .passthrough();

export const SiteDocumentGetBaseResponseSchema =
  SiteDocumentRecordSchemaInner.transform(
    ({ files, documentKeys, ...rest }) => ({
      ...rest,
      documentKeys:
        documentKeys ??
        files?.map((f: { fileKey?: string }) => f.fileKey).filter(Boolean) ??
        [],
    })
  );

export const SiteDocumentGetResponseSchema = z
  .object({
    records: z.array(SiteDocumentGetBaseResponseSchema),
    totalRecords: z.number().optional(),
  })
  .passthrough();
