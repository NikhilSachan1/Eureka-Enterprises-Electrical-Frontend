import { PetroCardBaseSchema } from '@features/transport-management/petro-card-management/schemas';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { onlyDateStringField, uuidField } from '@shared/schemas';
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

export const LinkedUserVehicleDetailSchema = VehicleBaseSchema.omit({
  cardId: true,
  additionalData: true,
}).extend({
  purchaseDate: onlyDateStringField,
  insuranceStartDate: onlyDateStringField,
  insuranceEndDate: onlyDateStringField,
  pucStartDate: onlyDateStringField,
  pucEndDate: onlyDateStringField,
  fitnessStartDate: onlyDateStringField,
  fitnessEndDate: onlyDateStringField,
  lastServiceDate: onlyDateStringField,
  lastServiceKm: z.number().int().min(1).nullable(),
});

export const LinkedVehiclePetroCardSchema = PetroCardBaseSchema.nullable();

export const LinkedUserVehicleDetailGetResponseSchema = z
  .object({
    vehicle: LinkedUserVehicleDetailSchema,
    card: LinkedVehiclePetroCardSchema.nullable(),
  })
  .strict();
