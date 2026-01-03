import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VehicleDeleteRequestSchema = z
  .object({
    vehicleIds: z.array(uuidField).min(1),
  })
  .strict();

export const VehicleDeleteResultSchema = z
  .object({
    vehicleId: uuidField,
    message: z.string(),
    previousStatus: z.string().min(1),
  })
  .strict();

export const VehicleDeleteErrorSchema = z
  .object({
    vehicleId: uuidField,
    error: z.string().min(1),
  })
  .strict();

export const VehicleDeleteResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(VehicleDeleteResultSchema),
    errors: z.array(VehicleDeleteErrorSchema),
  })
  .strict();
