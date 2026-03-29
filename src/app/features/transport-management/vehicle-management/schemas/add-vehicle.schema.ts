import { z } from 'zod';
import { VehicleUpsertShapeSchema } from './base-vehicle.schema';
import { transformDateFormat } from '@shared/utility';

export const VehicleAddRequestSchema =
  VehicleUpsertShapeSchema.strict().transform(data => {
    const [insuranceStartDate, insuranceEndDate] =
      data.vehicleInsuranceDate ?? [];
    const [pucStartDate, pucEndDate] = data.vehiclePUCDate ?? [];
    return {
      registrationNo: data.vehicleRegistrationNo,
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
      remarks: data.remarks,
      vehicleFiles: data.vehicleFiles,
    };
  });
export const VehicleAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
