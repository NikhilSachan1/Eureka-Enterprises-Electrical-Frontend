import { z } from 'zod';
import { VehicleBaseSchema } from './base-vehicle.schema';
import { fileField, uuidField } from '@shared/schemas';

const { id } = VehicleBaseSchema.shape;

export const ActionVehicleRequestSchema = z
  .object({
    vehicleId: id,
    action: z.string().min(1),
    toUserId: uuidField.nullable(),
    vehicleFiles: z.array(fileField).nullable(),
    metadata: z.record(z.string(), z.string()),
  })
  .strict();

export const ActionVehicleResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
