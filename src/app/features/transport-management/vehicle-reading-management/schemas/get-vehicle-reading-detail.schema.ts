import { uuidField } from '@shared/schemas';
import { z } from 'zod';
import { VehicleReadingGetBaseResponseSchema } from './get-vehicle-reading.schema';

export const VehicleReadingDetailGetRequestSchema = z
  .object({
    vehicleReadingId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.vehicleReadingId,
    };
  });

export const VehicleReadingDetailGetResponseSchema =
  VehicleReadingGetBaseResponseSchema;
