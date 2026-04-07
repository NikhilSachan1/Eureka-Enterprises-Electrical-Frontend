import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VehicleDeleteRequestSchema = z
  .object({
    vehicleIds: z.array(uuidField).min(1),
  })
  .strict();

export const VehicleDeleteResultSchema = z.looseObject({
  vehicleId: uuidField,
  message: z.string(),
  previousStatus: z.string().min(1),
});

export const VehicleDeleteErrorSchema = z.looseObject({
  vehicleId: uuidField,
  error: z.string().min(1),
});

export const VehicleDeleteResponseSchema = z.looseObject({
  message: z.string(),
  result: z.array(VehicleDeleteResultSchema),
  errors: z.array(VehicleDeleteErrorSchema),
});
