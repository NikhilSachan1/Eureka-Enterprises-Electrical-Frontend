import { z } from 'zod';
import { VehicleReadingUpsertShapeSchema } from './base-vehicle-reading.schema';
import { transformTimeFormat } from '@shared/utility';

export const VehicleReadingEditRequestSchema =
  VehicleReadingUpsertShapeSchema.omit({ vehicleName: true, readingDate: true })
    .strict()
    .transform(data => {
      return {
        startOdometerReading: data.startOdometerReading,
        startTime: transformTimeFormat(data.startTime),
        startLocation: data.startLocation,
        endOdometerReading: data.endOdometerReading,
        endTime: transformTimeFormat(data.endTime),
        endLocation: data.endLocation,
        driverRemarks: data.remarks,
        vehicleLogStartOdometer: data.startOdometerReadingAttachments,
        vehicleLogEndOdometer: data.endOdometerReadingAttachments,
      };
    });
export const VehicleReadingEditResponseSchema = z.looseObject({
  message: z.string(),
});
