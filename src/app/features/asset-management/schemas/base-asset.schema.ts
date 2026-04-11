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

export const AssetBaseSchema = z.looseObject({
  id: uuidField,
  assetId: z.string().min(1),
  name: z.string(),
  model: z.string().nullable(),
  serialNumber: z.string().nullable(),
  category: z.string().min(1),
  assetType: z.string().min(1),
  calibrationFrom: z.string().min(1).nullable(),
  calibrationFrequency: z.string().min(1).nullable(),
  calibrationStartDate: isoDateTimeField.nullable(),
  calibrationEndDate: isoDateTimeField.nullable(),
  purchaseDate: isoDateTimeField,
  vendorName: z.string().nullable(),
  warrantyStartDate: isoDateTimeField.nullable(),
  warrantyEndDate: isoDateTimeField.nullable(),
  status: z.string().min(1),
  remarks: z.string().trim().nullable(),
  additionalData: z.record(z.string(), z.string()).nullable(),
});

export const AssetBaseDocumentsSchema = z.looseObject({
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
});

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
    assetCalibrationDate: z.array(dateField).nullable(),
    assetPurchaseDate: dateField,
    assetVendorName: vendorName.nullable(),
    assetWarrantyDate: z.array(dateField).nullable(),
    assetFiles: z.array(fileField),
    remarks,
  })
  .strict();
