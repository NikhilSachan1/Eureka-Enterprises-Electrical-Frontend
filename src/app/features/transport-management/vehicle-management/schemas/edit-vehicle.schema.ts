import { z } from 'zod';
import { VehicleUpsertShapeSchema } from './base-vehicle.schema';
import { transformDateFormat } from '@shared/utility';

export const VehicleEditRequestSchema = VehicleUpsertShapeSchema.extend({
  vehicleRegistrationNo: z.string().optional(),
})
  .strict()
  .transform(data => {
    const [insuranceStartDate, insuranceEndDate] =
      data.vehicleInsuranceDate ?? [];
    const [pucStartDate, pucEndDate] = data.vehiclePUCDate ?? [];
    const [fitnessStartDate, fitnessEndDate] = data.vehicleFitnessDate ?? [];
    return {
      brand: data.vehicleBrand,
      model: data.vehicleModel,
      mileage: data.vehicleMileage,
      fuelType: data.vehicleFuelType,
      purchaseDate: transformDateFormat(data.vehiclePurchaseDate),
      dealerName: data.vehicleDealerName,
      insuranceStartDate: transformDateFormat(insuranceStartDate),
      insuranceEndDate: transformDateFormat(insuranceEndDate),
      pucStartDate: transformDateFormat(pucStartDate),
      pucEndDate: transformDateFormat(pucEndDate),
      fitnessStartDate: transformDateFormat(fitnessStartDate),
      fitnessEndDate: transformDateFormat(fitnessEndDate),
      remarks: data.remarks,
      vehicleFiles: data.vehicleFiles,
    };
  });
export const VehicleEditResponseSchema = z.object({
  message: z.string(),
});
