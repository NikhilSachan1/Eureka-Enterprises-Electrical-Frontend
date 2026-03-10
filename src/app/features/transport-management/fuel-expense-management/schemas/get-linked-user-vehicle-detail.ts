import { PetroCardBaseSchema } from '@features/transport-management/petro-card-management/schemas';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
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

export const LinkedUserVehicleDetailSchema = VehicleBaseSchema.pick({
  id: true,
  registrationNo: true,
  brand: true,
  model: true,
  fuelType: true,
  mileage: true,
}).loose();

export const LinkedVehiclePetroCardSchema = PetroCardBaseSchema.pick({
  id: true,
  cardNumber: true,
  cardType: true,
  cardName: true,
}).loose();

export const LinkedUserVehicleDetailGetResponseSchema = z
  .object({
    vehicle: LinkedUserVehicleDetailSchema,
    card: LinkedVehiclePetroCardSchema.nullable(),
  })
  .loose();
