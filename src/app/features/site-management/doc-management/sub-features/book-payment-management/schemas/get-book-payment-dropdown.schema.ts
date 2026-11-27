import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import { EPaymentTypeFilter } from '@features/site-management/doc-management/shared/config/payment-filter.config';

/**
 * Either an invoice (its bookings), or a project + payment type — advance bookings have no invoice
 * and GST releases sit outside it, so a bank transfer reaches them by project.
 */
export const BookPaymentDropdownGetRequestSchema = z.union([
  z
    .object({
      invoiceNumber: uuidField,
    })
    .transform(({ invoiceNumber }) => ({
      invoiceId: invoiceNumber,
    })),
  z
    .object({
      projectName: uuidField,
      paymentType: z.enum(EPaymentTypeFilter),
    })
    .transform(({ projectName, paymentType }) => ({
      siteId: projectName,
      paymentType,
    })),
]);

export const BookPaymentDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: z.looseObject({
    paymentTotalAmount: z.number(),
    /** paymentTotalAmount − paymentHoldAmount: what the bank transfer must equal. */
    expectedTransferAmount: z.number().optional(),
    paymentDate: z.string().optional(),
    bookingDate: z.string().optional(),
  }),
});

export const BookPaymentDropdownGetResponseSchema = z.object({
  records: z.array(BookPaymentDropdownRecordSchema),
});
