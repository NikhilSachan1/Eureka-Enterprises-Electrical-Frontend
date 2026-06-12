import { dateField, uuidField } from '@shared/schemas';
import { roundCurrencyAmount } from '@shared/utility/number.util';
import z from 'zod';

const bookPaymentMoneyFieldSchema = z.coerce
  .number()
  .transform(val => roundCurrencyAmount(val));

export const BookPaymentUpsertShapeSchema = z
  .object({
    invoiceNumber: uuidField,
    bookingDate: dateField,
    paymentTotalAmount: bookPaymentMoneyFieldSchema,
    paymentHoldReason: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
