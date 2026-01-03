import { z } from 'zod';
import { VehicleBaseSchema } from './base-vehicle.schema';
import { fileField, onlyDateStringField } from '@shared/schemas';

export const VehicleAddRequestSchema = VehicleBaseSchema.omit({
  id: true,
  status: true,
  additionalData: true,
  cardId: true,
})
  .extend({
    purchaseDate: onlyDateStringField,
    insuranceStartDate: onlyDateStringField,
    insuranceEndDate: onlyDateStringField,
    pucStartDate: onlyDateStringField,
    pucEndDate: onlyDateStringField,
    fitnessStartDate: onlyDateStringField,
    fitnessEndDate: onlyDateStringField,
    vehicleFiles: z.array(fileField),
  })
  .strict();

export const VehicleAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
