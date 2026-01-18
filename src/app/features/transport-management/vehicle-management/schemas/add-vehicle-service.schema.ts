import { transformDateFormat } from '@shared/utility';
import { VehicleServiceUpsertShapeSchema } from './base-vehicle-service.schema';
import { EVehicleServiceStatus } from '../types/vehicle-service.enum';
import z from 'zod';

export const VehicleServiceAddRequestSchema =
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
      serviceStatus: EVehicleServiceStatus.COMPLETED,
      remarks: data.remarks,
    };
  });

export const VehicleServiceAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
