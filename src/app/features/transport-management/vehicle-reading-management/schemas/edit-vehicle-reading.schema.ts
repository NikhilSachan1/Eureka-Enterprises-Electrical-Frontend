import { z } from 'zod';
import { VehicleReadingUpsertShapeSchema } from './base-vehicle-reading.schema';
import { transformDateFormat } from '@shared/utility';

export const VehicleReadingEditRequestSchema =
  VehicleReadingUpsertShapeSchema.strict().transform(data => {
    return {
      vehicleId: data.vehicleName,
      logDate: transformDateFormat(data.readingDate),
      startOdometerReading: data.startOdometerReading,
      startTime: data.startTime,
      startLocation: data.startLocation,
      endOdometerReading: data.endOdometerReading,
      endTime: data.endTime,
      endLocation: data.endLocation,
      remarks: data.remarks,
    };
  });
export const VehicleReadingEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
