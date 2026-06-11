import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const InvoiceDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
    forDocument: z.enum(['book-payment', 'bank-transfer']),
  })
  .transform(({ projectName, docType, forDocument }) => ({
    siteId: projectName,
    partyType: docType,
    forDocument,
  }));

const InvoiceDropdownMetaSchema = z.looseObject({
  taxableAmount: z.number(),
  gstAmount: z.number(),
  tdsAmount: z.number(),
  totalAmount: z.number(),
  bookedTotal: z.number().optional(),
  paidTotal: z.number().optional(),
  remaining: z.number().optional(),
});

export const InvoiceDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: InvoiceDropdownMetaSchema,
});

export const InvoiceDropdownGetResponseSchema = z.object({
  records: z.array(InvoiceDropdownRecordSchema),
});
