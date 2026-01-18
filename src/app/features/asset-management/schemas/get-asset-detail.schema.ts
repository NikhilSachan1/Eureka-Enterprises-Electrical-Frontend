import {
  AuditSchema,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import { AssetBaseDocumentsSchema, AssetBaseSchema } from './base-asset.schema';
import { makeFieldsNullable } from '@shared/utility';

const { createdAt, updatedAt, createdBy, updatedBy, deletedBy, deletedAt } =
  AuditSchema.shape;

export const AssetDetailGetRequestSchema = z
  .object({
    assetId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.assetId,
    };
  });

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
      files: z.array(AssetBaseDocumentsSchema),
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
    files: z.array(AssetBaseDocumentsSchema),
    deletedByUser: makeFieldsNullable(UserSchema).nullable(),
    versionHistory: z.array(AssetDetailGetVersionHistorySchema),
    calibrationStatus: z.string().min(1),
    warrantyStatus: z.string().min(1),
  })
  .strict();
