import { AuditSchema, onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';

const { createdAt, updatedAt } = AuditSchema.shape;

export const AssetDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const AssetDetailGetDocumentsSchema = z
  .object({
    ...AuditSchema.shape,
    id: uuidField,
    assetMasterId: uuidField,
    fileType: z.string().min(1),
    fileKey: z.string().min(1),
    label: z.string().nullable(),
    assetEventsId: uuidField,
  })
  .strict();

export const AssetDetailGetEventsSchema = z
  .object({
    ...AuditSchema.shape,
    id: uuidField,
    assetMasterId: uuidField,
    eventType: z.string().min(1),
    fromUser: uuidField.nullable(),
    toUser: uuidField.nullable(),
    metadata: z.record(z.string(), z.string()).nullable(),
  })
  .strict();

export const AssetDetailGetBaseResponseSchema = AssetBaseSchema.extend({
  createdAt,
  updatedAt,
}).strict();

export const AssetDetailGetVersionHistorySchema =
  AssetDetailGetBaseResponseSchema.omit({
    assetId: true,
    calibrationStatus: true,
    warrantyStatus: true,
  })
    .extend({
      ...AuditSchema.shape,
      calibrationStartDate: onlyDateStringField,
      calibrationEndDate: onlyDateStringField,
      purchaseDate: onlyDateStringField,
      warrantyStartDate: onlyDateStringField,
      warrantyEndDate: onlyDateStringField,
      assignedTo: uuidField.nullable(),
      assetMasterId: uuidField,
      isActive: z.boolean(),
    })
    .strict();

export const AssetDetailGetResponseSchema = z
  .object({
    ...AssetDetailGetBaseResponseSchema.shape,
    calibrationStartDate: onlyDateStringField,
    calibrationEndDate: onlyDateStringField,
    purchaseDate: onlyDateStringField,
    warrantyStartDate: onlyDateStringField,
    warrantyEndDate: onlyDateStringField,
    assignedTo: uuidField.nullable(),
    files: z.array(AssetDetailGetDocumentsSchema),
    events: z.array(AssetDetailGetEventsSchema),
    versionHistory: z.array(AssetDetailGetVersionHistorySchema),
  })
  .strict()
  .transform(({ files, ...rest }) => ({
    ...rest,
    files,
    documentKeys: files.map(file => file.fileKey),
  }));
