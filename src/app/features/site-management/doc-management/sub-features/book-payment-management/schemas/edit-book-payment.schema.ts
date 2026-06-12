import { transformDateFormat } from '@shared/utility/date-time.util';
import z from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const EditBookPaymentRequestSchema = BookPaymentUpsertShapeSchema.omit({
  invoiceNumber: true,
}).transform(data => ({
  bookingDate: transformDateFormat(data.bookingDate),
  transferAmount: data.paymentTotalAmount,
  paymentHoldReason: data.paymentHoldReason ?? null,
  remarks: data.remarks ?? null,
}));

export const EditBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
