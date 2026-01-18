import { dateField, fileField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VehicleServiceBaseSchema = z.object({
  id: uuidField,
});

export const VehicleServiceUpsertShapeSchema = z
  .object({
    vehicleId: uuidField,
    serviceDate: dateField,
    odometerKm: z.number(),
    serviceType: z.string(),
    serviceDescription: z.string(),
    serviceAttachments: z.array(fileField),
    serviceCenterName: z.string(),
    serviceCost: z.number(),
    remarks: z.string(),
  })
  .strict();
