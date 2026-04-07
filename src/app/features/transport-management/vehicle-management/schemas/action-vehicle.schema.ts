import { z } from 'zod';
import { VehicleBaseSchema } from './base-vehicle.schema';
import { fileField, uuidField } from '@shared/schemas';

const { id } = VehicleBaseSchema.shape;

export const ActionVehicleRequestSchema = z
  .object({
    vehicleId: id,
    actionType: z.string().min(1),
    allocatedToEmployeeName: uuidField.nullable(),
    vehicleImages: z.array(fileField).nullable(),
    remark: z.string().nullable(),
  })
  .strict()
  .transform(data => {
    return {
      vehicleId: data.vehicleId,
      action: data.actionType,
      toUserId: data.allocatedToEmployeeName,
      vehicleFiles: data.vehicleImages,
      metadata: {
        remark: data.remark,
      },
    };
  });
export const ActionVehicleResponseSchema = z.looseObject({
  message: z.string().min(1),
});
