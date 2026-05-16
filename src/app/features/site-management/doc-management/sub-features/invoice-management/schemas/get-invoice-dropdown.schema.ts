import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const InvoiceDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
  })
  .transform(({ projectName, docType }) => ({
    siteId: projectName,
    partyType: docType,
    forDocument:
      docType === EDocContext.SALES ? 'bank-transfer' : 'book-payment',
  }));

const InvoiceDropdownMetaSchema = z.looseObject({
  invoiceNumber: z.string(),
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
