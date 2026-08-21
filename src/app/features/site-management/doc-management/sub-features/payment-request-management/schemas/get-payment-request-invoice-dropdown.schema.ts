import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const PaymentRequestInvoiceDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
  })
  .transform(({ projectName, docType }) => ({
    siteId: projectName,
    partyType: docType,
  }));
