import { z } from 'zod';

/** PATCH request - permissive, multipart form data */
export const SiteDocumentEditRequestSchema = z
  .object({
    gstAmount: z.union([z.number(), z.string()]).optional(),
    siteId: z.string().optional(),
    dueDate: z.string().optional(),
    documentNumber: z.string().optional(),
    paymentReference: z.string().optional(),
    documentDate: z.string().optional(),
    contractorId: z.string().optional(),
    status: z.string().optional(),
    remarks: z.string().optional(),
    paymentDate: z.string().optional(),
    documentType: z.string().optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    paymentStatus: z.string().optional(),
    totalAmount: z.union([z.number(), z.string()]).optional(),
    direction: z.string().optional(),
    attachment: z.any().optional(),
  })
  .passthrough();

export const SiteDocumentEditResponseSchema = z
  .object({
    message: z.string().optional(),
  })
  .passthrough();
