import { z } from 'zod';
import { AssetBaseDocumentsSchema, AssetBaseSchema } from './base-asset.schema';
import {
  AuditSchema,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { createdAt, updatedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const AssetGetRequestSchema = z
  .object({
    assetAssignee: z.string().optional(),
    warrantyStatus: z.array(z.string()).optional(),
    calibrationStatus: z.array(z.string()).optional(),
    assetStatus: z.array(z.string()).optional(),
    assetType: z.string().optional(),
    category: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ assetStatus, assetAssignee, ...rest }) => {
    return {
      ...rest,
      assignedTo: assetAssignee,
      status: assetStatus,
    };
  });

export const AssetGetBaseResponseSchema = z
  .object({
    ...AssetBaseSchema.shape,
    assignedTo: uuidField.nullable().optional(),
    assignedToUser: makeFieldsNullable(UserSchema).nullable(),
    files: z.array(AssetBaseDocumentsSchema),
    warrantyStatus: z.string().min(1),
    calibrationStatus: z.string().min(1),
    createdAt,
    updatedAt,
  })
  .strict()
  .transform(({ files, ...rest }) => ({
    ...rest,
    documentKeys: files.map(file => file.fileKey),
  }));

export const AssetGetStatsResponseSchema = z
  .object({
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
  })
  .strict();

export const AssetGetResponseSchema = z
  .object({
    records: z.array(AssetGetBaseResponseSchema),
    stats: AssetGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
