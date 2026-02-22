import z from 'zod';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import { transformDateFormat } from '@shared/utility';

export const FuelExpenseEditRequestSchema =
  FuelExpenseUpsertShapeSchema.strict().transform(data => {
    return {
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

export const FuelExpenseEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
