import {
  dateField,
  fileField,
  isoDateTimeField,
  AuditSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';

const { createdAt, updatedAt } = AuditSchema.shape;

export const VehicleServiceBaseSchema = z.object({
  id: uuidField,
  vehicleMasterId: uuidField,
  serviceDate: isoDateTimeField,
  odometerReading: z.number().int().nonnegative(),
  serviceType: z.string(),
  serviceDetails: z.string().nullable(),
  serviceCenterName: z.string(),
  serviceCost: z.string(),
  serviceStatus: z.string(),
  resetsServiceInterval: z.boolean(),
  remarks: z.string().nullable(),
  createdAt,
  updatedAt,
});

export const VehicleServiceUpsertShapeSchema = z
  .object({
    vehicleName: uuidField,
    serviceDate: dateField,
    odometerReading: z.number(),
    serviceType: z.string(),
    serviceAttachments: z.array(fileField),
    serviceCenterName: z.string(),
    serviceCost: z.number(),
    remarks: z.string().nullable(),
  })
  .strict();
