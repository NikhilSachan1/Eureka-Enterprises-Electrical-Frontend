import { z } from 'zod';
import { AdvancePaymentUpsertShapeSchema } from './base-advance-payment.schema';
import { roundCurrencyAmount } from '@shared/utility';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddAdvancePaymentRequestSchema =
  AdvancePaymentUpsertShapeSchema.pick({
    poNumber: true,
    vendorAdvanceNumber: true,
    amount: true,
    advanceDate: true,
    fileKey: true,
    fileName: true,
  })
    .strict()
    .transform(data => ({
      poId: data.poNumber,
      vendorAdvanceNumber: data.vendorAdvanceNumber.trim(),
      amount: roundCurrencyAmount(Number(data.amount)),
      advanceDate: transformDateFormat(data.advanceDate),
      fileKey: data.fileKey,
      fileName: data.fileName,
    }));

export const AddAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
  id: z.string().optional(),
});
