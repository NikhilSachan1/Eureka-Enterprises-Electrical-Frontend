import {
  AuditSchema,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { makeFieldsNullable } from '@shared/utility';

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
  createdByUser: UserSchema,
  assignedToUser: makeFieldsNullable(UserSchema).nullable(),
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
}).strict();

export const AssetDetailGetVersionHistorySchema =
  AssetDetailGetBaseResponseSchema.omit({
    assetId: true,
    calibrationStatus: true,
    warrantyStatus: true,
  })
    .extend({
      calibrationStartDate: onlyDateStringField,
      calibrationEndDate: onlyDateStringField,
      purchaseDate: onlyDateStringField,
      warrantyStartDate: onlyDateStringField,
      warrantyEndDate: onlyDateStringField,
      assignedTo: uuidField.nullable(),
      assetMasterId: uuidField,
      isActive: z.boolean(),
      files: z.array(AssetDetailGetDocumentsSchema),
      createdBy,
      updatedBy: updatedBy.nullable(),
    })
    .strict()
    .transform(({ files, ...rest }) => ({
      ...rest,
      documentKeys: files.map(file => file.fileKey),
    }));

export const AssetDetailGetResponseSchema = z
  .object({
    ...AssetDetailGetBaseResponseSchema.shape,
    createdBy,
    updatedBy: updatedBy.nullable(),
    deletedBy: deletedBy.nullable(),
    deletedAt: deletedAt.nullable().optional(),
    calibrationStartDate: onlyDateStringField,
    calibrationEndDate: onlyDateStringField,
    purchaseDate: onlyDateStringField,
    warrantyStartDate: onlyDateStringField,
    warrantyEndDate: onlyDateStringField,
    assignedTo: uuidField.nullable(),
    files: z.array(AssetDetailGetDocumentsSchema),
    deletedByUser: makeFieldsNullable(UserSchema).nullable(),
    versionHistory: z.array(AssetDetailGetVersionHistorySchema),
  })
  .strict();
