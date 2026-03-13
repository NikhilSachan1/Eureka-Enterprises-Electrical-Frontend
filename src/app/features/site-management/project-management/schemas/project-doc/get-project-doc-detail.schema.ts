import { z } from 'zod';

/** Get by ID - permissive */
export const SiteDocumentDetailGetRequestSchema = z
  .object({
    id: z.string(),
  })
  .passthrough();

export const SiteDocumentDetailGetResponseSchema = z
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
    paymentDate: z.string().optional(),
    paymentReference: z.string().optional(),
    remarks: z.string().optional(),
    direction: z.string().optional(),
    siteId: z.string().optional(),
    contractorId: z.string().optional(),
    files: z.array(z.record(z.string(), z.any())).optional(),
    documentKeys: z.array(z.string()).optional(),
  })
  .passthrough();
