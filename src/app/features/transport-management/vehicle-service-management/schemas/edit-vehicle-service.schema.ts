import { z } from 'zod';
import { VehicleServiceUpsertShapeSchema } from './base-vehicle-service.schema';
import { transformDateFormat } from '@shared/utility';

export const VehicleServiceEditRequestSchema =
  VehicleServiceUpsertShapeSchema.omit({
    vehicleName: true,
  })
    .strict()
    .transform(data => {
      return {
        serviceDate: transformDateFormat(data.serviceDate),
        odometerReading: data.odometerReading,
        serviceType: data.serviceType,
        serviceFiles: data.serviceAttachments,
        serviceCenterName: data.serviceCenterName,
        serviceCost: data.serviceCost,
        remarks: data.remarks,
      };
    });

export const VehicleServiceEditResponseSchema = z.object({
  message: z.string(),
});
