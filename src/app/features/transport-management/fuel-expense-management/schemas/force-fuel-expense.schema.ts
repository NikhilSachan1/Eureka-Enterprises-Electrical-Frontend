import { uuidField } from '@shared/schemas';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import z from 'zod';
import { transformDateFormat } from '@shared/utility';

export const FuelExpenseForceRequestSchema =
  FuelExpenseUpsertShapeSchema.extend({
    employeeName: uuidField,
  })
    .strict()
    .transform(data => {
      return {
        userId: data.employeeName,
        vehicleId: data.vehicleName,
        cardId: data.cardName,
        fillDate: transformDateFormat(data.fuelFillDate),
        odometerKm: data.odometerReading,
        fuelLiters: data.fuelLiters,
        fuelAmount: data.fuelAmount,
        paymentMode: data.paymentMode,
        transactionId: data.transactionId,
        description: data.remark,
        files: data.fuelExpenseAttachments,
      };
    });

export const FuelExpenseForceResponseSchema = z.looseObject({
  message: z.string(),
});
