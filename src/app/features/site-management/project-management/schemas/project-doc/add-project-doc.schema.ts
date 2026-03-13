import { z } from 'zod';

/** POST request - single document, multipart form data. Only: siteId, documentType, totalAmount, documentDate, documentNumber, siteDocumentFiles */
export const SiteDocumentAddRequestSchema = z
  .object({
    siteId: z.string(),
    documentType: z.string(),
    totalAmount: z.union([z.number(), z.string()]),
    documentDate: z.string(),
    documentNumber: z.string(),
    siteDocumentFiles: z
      .union([z.array(z.instanceof(File)), z.any()])
      .optional(),
  })
  .passthrough();

export const SiteDocumentAddResponseSchema = z
  .object({
    message: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough();
