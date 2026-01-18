import { z } from 'zod';
import { VehicleServiceUpsertShapeSchema } from './base-vehicle-service.schema';
import { transformDateFormat } from '@shared/utility';

export const VehicleServiceEditRequestSchema =
  VehicleServiceUpsertShapeSchema.strict().transform(data => {
    return {
      vehicleMasterId: data.vehicleId,
      serviceDate: transformDateFormat(data.serviceDate),
      odometerReading: data.odometerKm,
      serviceType: data.serviceType,
      serviceDetails: data.serviceDescription,
      serviceFiles: data.serviceAttachments,
      serviceCenterName: data.serviceCenterName,
      serviceCost: data.serviceCost,
      remarks: data.remarks,
    };
  });

export const VehicleServiceEditResponseSchema = z.object({
  message: z.string(),
});
