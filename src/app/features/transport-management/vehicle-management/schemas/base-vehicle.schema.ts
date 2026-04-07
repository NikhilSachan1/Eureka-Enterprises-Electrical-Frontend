import {
  AuditSchema,
  dateField,
  fileField,
  isoDateTimeField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';

const { createdBy, updatedBy, deletedBy, createdAt, updatedAt, deletedAt } =
  AuditSchema.shape;

export const VehicleBaseSchema = z.looseObject({
  id: uuidField,
  registrationNo: z.string().min(1),
  cardId: uuidField.nullable(),
  brand: z.string().min(1),
  model: z.string().min(1),
  mileage: z.string().min(1),
  fuelType: z.string().min(1),
  purchaseDate: isoDateTimeField,
  dealerName: z.string().min(1),
  insuranceStartDate: isoDateTimeField.nullable(),
  insuranceEndDate: isoDateTimeField.nullable(),
  pucStartDate: isoDateTimeField.nullable(),
  pucEndDate: isoDateTimeField.nullable(),
  fitnessStartDate: isoDateTimeField.nullable(),
  fitnessEndDate: isoDateTimeField.nullable(),
  remarks: z.string().trim(),
  status: z.string().min(1),
  additionalData: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .nullable(),
});

export const VehicleBaseDocumentsSchema = z.looseObject({
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
});

const { registrationNo, brand, model, mileage, fuelType, dealerName, remarks } =
  VehicleBaseSchema.shape;

export const VehicleUpsertShapeSchema = z
  .object({
    vehicleRegistrationNo: registrationNo,
    vehicleBrand: brand,
    vehicleModel: model,
    vehicleMileage: mileage,
    vehicleFuelType: fuelType,
    vehiclePurchaseDate: dateField,
    vehicleDealerName: dealerName,
    vehicleInsuranceDate: z.array(dateField),
    vehiclePUCDate: z.array(dateField),
    remarks,
    vehicleFiles: z.array(fileField),
  })
  .strict();
