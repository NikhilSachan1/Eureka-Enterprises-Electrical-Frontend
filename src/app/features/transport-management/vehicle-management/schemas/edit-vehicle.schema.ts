import { z } from 'zod';
import { VehicleAddRequestSchema } from './add-vehicle.schema';

export const VehicleEditRequestSchema = VehicleAddRequestSchema.omit({
  registrationNo: true,
}).strict();
export const VehicleEditResponseSchema = z.object({
  message: z.string(),
});
