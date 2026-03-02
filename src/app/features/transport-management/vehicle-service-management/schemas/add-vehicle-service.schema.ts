import { transformDateFormat } from '@shared/utility';
import { VehicleServiceUpsertShapeSchema } from './base-vehicle-service.schema';
import { EVehicleServiceStatus } from '../types/vehicle-service.enum';
import z from 'zod';

export const VehicleServiceAddRequestSchema =
  VehicleServiceUpsertShapeSchema.strict().transform(data => {
    return {
      vehicleMasterId: data.vehicleName,
      serviceDate: transformDateFormat(data.serviceDate),
      odometerReading: data.odometerReading,
      serviceType: data.serviceType,
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
