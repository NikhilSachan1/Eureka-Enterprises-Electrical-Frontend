import { z } from 'zod';
import { AssetBaseDocumentsSchema, AssetBaseSchema } from './base-asset.schema';
import {
  AuditSchema,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { AssetEventHistoryGetBaseResponseObjectSchema } from './get-asset-event-history.schema';

const { createdAt, updatedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const AssetGetRequestSchema = z
  .object({
    assetAssignee: z.string().optional(),
    assetWarrantyStatus: z.array(z.string()).optional(),
    assetCalibrationStatus: z.array(z.string()).optional(),
    assetStatus: z.string().optional(),
    assetType: z.string().optional(),
    assetCategory: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      assetStatus,
      assetAssignee,
      assetCategory,
      assetCalibrationStatus,
      assetWarrantyStatus,
      ...rest
    }) => {
      return {
        ...rest,
        assignedTo: assetAssignee,
        status: assetStatus,
        category: assetCategory,
        calibrationStatus: assetCalibrationStatus,
        warrantyStatus: assetWarrantyStatus,
        includeLatestEventFiles: true,
      };
    }
  );

export const AssetGetBaseResponseSchema = z
  .looseObject({
    ...AssetBaseSchema.shape,
    assignedTo: uuidField.nullable().optional(),
    assignedToUser: makeFieldsNullable(UserSchema).nullable(),
    files: z.array(AssetBaseDocumentsSchema),
    warrantyStatus: z.string().min(1),
    calibrationStatus: z.string().min(1),
    latestEvent: AssetEventHistoryGetBaseResponseObjectSchema.pick({
      id: true,
      eventType: true,
      metadata: true,
      // createdAt: true
    })
      .extend({
        fromUser: uuidField.nullable(),
        toUser: uuidField.nullable(),
        fromUserUser: makeFieldsNullable(UserSchema).nullable(),
        toUserUser: makeFieldsNullable(UserSchema).nullable(),
        createdBy: uuidField,
        assetFiles: z.array(AssetBaseDocumentsSchema).optional().nullable(),
      })
      .nullable(),
    createdAt,
    updatedAt,
  })
  .transform(({ files, ...rest }) => ({
    ...rest,
    documentKeys: files.map(file => file.fileKey),
  }));

export const AssetGetStatsResponseSchema = z.looseObject({
  total: z.number().int().nonnegative(),
  byStatus: z.object({
    available: z.number().int().nonnegative(),
    assigned: z.number().int().nonnegative(),
    underMaintenance: z.number().int().nonnegative(),
    damaged: z.number().int().nonnegative(),
    retired: z.number().int().nonnegative(),
  }),
  byAssetType: z.object({
    calibrated: z.number().int().nonnegative(),
    nonCalibrated: z.number().int().nonnegative(),
  }),
  calibration: z.object({
    valid: z.number().int().nonnegative(),
    expiringSoon: z.number().int().nonnegative(),
    expired: z.number().int().nonnegative(),
  }),
  warranty: z.object({
    valid: z.number().int().nonnegative(),
    expiringSoon: z.number().int().nonnegative(),
    expired: z.number().int().nonnegative(),
    notApplicable: z.number().int().nonnegative(),
  }),
});

export const AssetGetResponseSchema = z.looseObject({
  records: z.array(AssetGetBaseResponseSchema),
  stats: AssetGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
