import { transformDateFormat } from '@shared/utility/date-time.util';
import z from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const EditBookPaymentRequestSchema = BookPaymentUpsertShapeSchema.omit({
  invoiceNumber: true,
  paymentTotalAmount: true,
}).transform(data => ({
  bookingDate: transformDateFormat(data.bookingDate),
  taxableAmount: data.taxableAmount,
  gstAmount: data.gstAmount,
  gstPercentage: data.gstPercentage,
  tdsDeductionAmount: data.tdsDeductionAmount,
  tdsPercentage: data.tdsPercentage,
  paymentHoldReason: data.paymentHoldReason ?? null,
  remarks: data.remarks ?? null,
}));

export const EditBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
