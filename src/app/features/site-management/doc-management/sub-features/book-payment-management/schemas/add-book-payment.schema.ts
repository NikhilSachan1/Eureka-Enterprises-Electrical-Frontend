import { transformDateFormat } from '@shared/utility/date-time.util';
import z from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const AddBookPaymentRequestSchema =
  BookPaymentUpsertShapeSchema.transform(data => ({
    invoiceId: data.invoiceNumber,
    bookingDate: transformDateFormat(data.bookingDate),
    taxableAmount: data.taxableAmount,
    paymentHoldReason: data.paymentHoldReason ?? null,
    remarks: data.remarks ?? null,
  }));

export const AddBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
