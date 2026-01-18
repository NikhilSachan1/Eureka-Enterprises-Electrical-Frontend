import {
  AuditSchema,
  dateField,
  fileField,
  isoDateTimeField,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';

const { createdBy, updatedBy, deletedBy, createdAt, updatedAt, deletedAt } =
  AuditSchema.shape;

export const AssetBaseSchema = z
  .object({
    id: uuidField,
    assetId: z.string().min(1),
    name: z.string(),
    model: z.string().nullable(),
    serialNumber: z.string().nullable(),
    category: z.string().min(1),
    assetType: z.string().min(1),
    calibrationFrom: z.string().min(1),
    calibrationFrequency: z.string().min(1),
    calibrationStartDate: isoDateTimeField,
    calibrationEndDate: isoDateTimeField,
    purchaseDate: isoDateTimeField,
    vendorName: z.string().min(1),
    warrantyStartDate: isoDateTimeField,
    warrantyEndDate: isoDateTimeField,
    status: z.string().min(1),
    remarks: z.string().trim(),
    additionalData: z.record(z.string(), z.string()).nullable(),
  })
  .strict();

export const AssetBaseDocumentsSchema = z
  .object({
    createdBy: createdBy.nullable().optional(),
    updatedBy: updatedBy.nullable().optional(),
    deletedBy: deletedBy.nullable().optional(),
    deletedAt: deletedAt.nullable().optional(),
    createdAt: createdAt.nullable().optional(),
    updatedAt: updatedAt.nullable().optional(),
    id: uuidField,
    assetMasterId: uuidField.optional(),
    fileType: z.string().min(1),
    fileKey: z.string().min(1),
    label: z.string().nullable(),
    assetEventsId: uuidField.optional(),
    assetVersionId: uuidField.optional(),
  })
  .strict();

const {
  assetId,
  name,
  model,
  serialNumber,
  category,
  assetType,
  calibrationFrom,
  calibrationFrequency,
  vendorName,
  remarks,
} = AssetBaseSchema.shape;
export const AssetUpsertShapeSchema = z
  .object({
    assetId,
    assetName: name,
    assetModel: model,
    assetSerialNumber: serialNumber,
    assetCategory: category,
    assetType,
    assetCalibrationFrom: calibrationFrom,
    assetCalibrationFrequency: calibrationFrequency,
    assetCalibrationDate: z.array(dateField),
    assetPurchaseDate: dateField,
    assetVendorName: vendorName,
    assetWarrantyDate: z.array(dateField),
    assetFiles: z.array(fileField),
    remarks,
  })
  .strict();
