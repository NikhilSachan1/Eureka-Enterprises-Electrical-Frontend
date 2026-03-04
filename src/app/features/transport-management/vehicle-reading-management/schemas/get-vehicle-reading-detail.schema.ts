import { uuidField } from '@shared/schemas';
import { z } from 'zod';
import { VehicleReadingBaseSchema } from './base-vehicle-reading.schema';

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

export const VehicleReadingDetailGetBaseResponseSchema =
  VehicleReadingBaseSchema.strict();

export const VehicleReadingDetailGetResponseSchema = z.object({}).strict();
