import { z } from 'zod';

/** Base shape for site document - permissive for now, user will tighten later */
export const SiteDocumentBaseSchema = z
  .object({
    id: z.string().optional(),
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
    documentKeys: z.array(z.string()).optional(),
    fileKeys: z.array(z.string()).optional(),
  })
  .passthrough();

export type ISiteDocumentBase = z.infer<typeof SiteDocumentBaseSchema>;
