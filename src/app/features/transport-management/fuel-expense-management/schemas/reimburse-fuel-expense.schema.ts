import { uuidField } from '@shared/schemas';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import z from 'zod';
import { transformDateFormat } from '@shared/utility';

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
      transactionId: transactionId.unwrap(),
    })
    .strict()
    .transform(data => {
      return {
        userId: data.employeeName,
        fuelAmount: data.fuelAmount,
        paymentMode: data.paymentMode,
        transactionId: data.transactionId,
        fillDate: transformDateFormat(data.fuelFillDate),
        files: data.fuelExpenseAttachments,
        description: data.remark,
      };
    });

export const FuelExpenseReimburseResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
