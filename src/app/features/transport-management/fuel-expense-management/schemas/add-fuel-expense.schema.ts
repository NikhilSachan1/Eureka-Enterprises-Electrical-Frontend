import { uuidField } from '@shared/schemas';
import z from 'zod';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import { transformDateFormat } from '@shared/utility';

export const FuelExpenseAddRequestSchema = FuelExpenseUpsertShapeSchema.extend(
  {
    employeeName: uuidField.nullable(),
  }
)
  .strict()
  .transform(data => {
    return {
      ...(data.employeeName ? { userId: data.employeeName } : {}),
      vehicleId: data.vehicleName,
      cardId: data.cardName,
      fillDate: transformDateFormat(data.fuelFillDate),
      odometerKm: data.odometerReading,
      fuelLiters: data.fuelLiters,
      fuelAmount: data.fuelAmount,
      paymentMode: data.paymentMode,
      transactionId: data.transactionId,
      description: data.remark?.trim() ?? '',
      files: data.fuelExpenseAttachments,
    };
  });

export const FuelExpenseAddResponseSchema = z.looseObject({
  message: z.string(),
});
