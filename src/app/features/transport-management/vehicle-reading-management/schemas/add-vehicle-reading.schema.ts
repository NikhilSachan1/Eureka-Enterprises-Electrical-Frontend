import { z } from 'zod';
import { VehicleReadingUpsertShapeSchema } from './base-vehicle-reading.schema';
import { transformDateFormat } from '@shared/utility';
import { transformTimeFormat } from '@shared/utility/date-time.util';

export const VehicleReadingAddRequestSchema =
  VehicleReadingUpsertShapeSchema.strict().transform(data => {
    return {
      vehicleId: data.vehicleName,
      logDate: transformDateFormat(data.readingDate),
      startOdometerReading: data.startOdometerReading,
      startTime: transformTimeFormat(data.startTime),
      startLocation: data.startLocation,
      endOdometerReading: data.endOdometerReading,
      endTime: transformTimeFormat(data.endTime),
      endLocation: data.endLocation,
      remark: data.remarks,
    };
  });
export const VehicleReadingAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
