import { z } from 'zod';
import { VehicleServiceBaseSchema } from './base-vehicle-service.schema';

const { id } = VehicleServiceBaseSchema.shape;

export const VehicleServiceDeleteRequestSchema = z
  .object({
    vehicleServiceIds: z.array(id).min(1),
  })
  .strict()
  .transform(data => {
    return {
      serviceIds: data.vehicleServiceIds,
    };
  });

export const VehicleServiceDeleteResultSchema = z
  .object({
    vehicleServiceId: id,
    message: z.string(),
  })
  .strict();

export const VehicleServiceDeleteErrorSchema = z
  .object({
    vehicleServiceId: id,
    error: z.string().min(1),
  })
  .strict();

export const VehicleServiceDeleteResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(VehicleServiceDeleteResultSchema),
    errors: z.array(VehicleServiceDeleteErrorSchema),
  })
  .strict();
