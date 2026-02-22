import { uuidField } from '@shared/schemas';
import z from 'zod';

export const LinkedUserVehicleDetailGetRequestSchema = z
  .object({
    employeeName: uuidField.nullable(),
  })
  .strict()
  .transform(({ employeeName }) => {
    return {
      userId: employeeName,
    };
  });

export const LinkedUserVehicleDetailSchema = z
  .object({
    vehicle: z.object({
      id: uuidField,
      registrationNumber: z.string().min(1),
      vehicleType: z.string().min(1),
      vehicleModel: z.string().min(1),
    }),
  })
  .strict();

export const LinkedVehiclePetroCardSchema = z
  .object({
    id: uuidField,
    cardNumber: z.string().min(1),
    cardType: z.string().min(1),
  })
  .strict();

export const LinkedUserVehicleDetailGetResponseSchema = z
  .object({
    vehicle: LinkedVehiclePetroCardSchema,
    card: LinkedVehiclePetroCardSchema.nullable(),
  })
  .strict();
