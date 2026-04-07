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

export const VehicleServiceDeleteResultSchema = z.looseObject({
  serviceId: id,
  message: z.string(),
  serviceType: z.string(),
  serviceStatus: z.string(),
});

export const VehicleServiceDeleteErrorSchema = z.looseObject({
  serviceId: id,
  error: z.string().min(1),
});

export const VehicleServiceDeleteResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(VehicleServiceDeleteResultSchema),
  errors: z.array(VehicleServiceDeleteErrorSchema),
});
