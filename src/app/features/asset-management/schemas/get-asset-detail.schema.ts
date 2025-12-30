import { AuditSchema, onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';

const { createdAt, updatedAt, createdBy, updatedBy, deletedBy, deletedAt } =
  AuditSchema.shape;

export const AssetDetailGetRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const AssetDetailGetDocumentsSchema = z
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
      files: z.array(AssetDetailGetDocumentsSchema),
    })
    .strict()
    .transform(({ files, ...rest }) => ({
      ...rest,
      documentKeys: files.map(file => file.fileKey),
    }));

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
    versionHistory: z.array(AssetDetailGetVersionHistorySchema),
  })
  .strict();
