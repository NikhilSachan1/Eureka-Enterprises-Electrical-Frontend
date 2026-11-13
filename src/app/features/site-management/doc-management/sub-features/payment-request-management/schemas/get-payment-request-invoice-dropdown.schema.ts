import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const PaymentRequestInvoiceDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
  })
  // An approved request becomes a book payment, so the invoice list is the book-payment one:
  // "Remaining" is net payable less advances settled and bookings already made.
  .transform(({ projectName, docType }) => ({
    siteId: projectName,
    partyType: docType,
    forDocument: 'book-payment' as const,
  }));
