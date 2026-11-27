import { uuidField } from '@shared/schemas';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import * as z from 'zod';
import { transformDateFormat } from '@shared/utility';
import {
  DirectPaymentSheetRefSchema,
  PaymentRecordModeField,
} from '@features/centralized-payment-management/payment-sheet-management/schemas/direct-payment-sheet.schema';

const { transactionId } = FuelExpenseUpsertShapeSchema.shape;

export const FuelExpenseReimburseRequestSchema =
  FuelExpenseUpsertShapeSchema.omit({
    vehicleName: true,
    cardName: true,
    odometerReading: true,
    fuelLiters: true,
  })
    .extend({
      employeeName: uuidField,
      paidFromAccount: uuidField.nullable(),
      transactionId: transactionId.unwrap(),
      // Picks the endpoint in the service; not part of the body.
      recordMode: PaymentRecordModeField,
    })
    .strict()
    .transform(data => {
      return {
        userId: data.employeeName,
        fuelAmount: data.fuelAmount,
        paymentMode: data.paymentMode,
        paidFromAccountId: data.paidFromAccount ?? null,
        transactionId: data.transactionId,
        description: data.remark ?? 'N/A',
        fillDate: transformDateFormat(data.fuelFillDate),
        files: data.fuelExpenseAttachments,
      };
    });

export const FuelExpenseReimburseResponseSchema = z.looseObject({
  message: z.string(),
  paymentSheet: DirectPaymentSheetRefSchema,
});
