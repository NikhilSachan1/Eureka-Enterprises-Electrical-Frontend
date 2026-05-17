import { z } from 'zod';
import { uuidField } from '@shared/schemas';

export const BookPaymentDropdownGetRequestSchema = z
  .object({
    invoiceNumber: uuidField,
  })
  .transform(({ invoiceNumber }) => ({
    invoiceId: invoiceNumber,
  }));

export const BookPaymentDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: z.looseObject({
    paymentTotalAmount: z.number(),
    paymentDate: z.string().optional(),
    bookingDate: z.string().optional(),
  }),
});

export const BookPaymentDropdownGetResponseSchema = z.object({
  records: z.array(BookPaymentDropdownRecordSchema),
});
