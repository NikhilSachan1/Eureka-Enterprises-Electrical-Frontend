import { AuditSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

const { createdBy, updatedBy, deletedBy, createdAt, updatedAt, deletedAt } =
  AuditSchema.shape;

export const VehicleBaseSchema = z
  .object({
    id: uuidField,
    registrationNo: z.string().min(1),
    cardId: uuidField.nullable(),
    brand: z.string().min(1),
    model: z.string().min(1),
    mileage: z.string().min(1),
    fuelType: z.string().min(1),
    purchaseDate: isoDateTimeField,
    dealerName: z.string().min(1),
    insuranceStartDate: isoDateTimeField,
    insuranceEndDate: isoDateTimeField,
    pucStartDate: isoDateTimeField,
    pucEndDate: isoDateTimeField,
    fitnessStartDate: isoDateTimeField,
    fitnessEndDate: isoDateTimeField,
    remarks: z.string().trim(),
    status: z.string().min(1),
    additionalData: z
      .record(z.string(), z.union([z.string(), z.number()]))
      .nullable(),
  })
  .strict();

export const VehicleBaseDocumentsSchema = z
  .object({
    createdBy: createdBy.nullable().optional(),
    updatedBy: updatedBy.nullable().optional(),
    deletedBy: deletedBy.nullable().optional(),
    deletedAt: deletedAt.nullable().optional(),
    createdAt: createdAt.nullable().optional(),
    updatedAt: updatedAt.nullable().optional(),
    id: uuidField,
    vehicleMasterId: uuidField.optional(),
    fileType: z.string().min(1),
    fileKey: z.string().min(1),
    label: z.string().nullable(),
    vehicleEventsId: uuidField.optional(),
    vehicleVersionId: uuidField.optional(),
  })
  .strict();
