import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import { AssetDetailGetBaseResponseSchema } from './get-asset-detail.schema';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';
import { AssetBaseDocumentsSchema } from './base-asset.schema';

const { createdAt, updatedAt, createdBy } = AuditSchema.shape;
const { id, name, assetId, model, serialNumber, category, status } =
  AssetDetailGetBaseResponseSchema.shape;

export const AssetEventHistoryGetRequestSchema = z
  .object({
    ...FilterSchema.shape,
    assetName: z.string().optional(),
    assetEventTypes: z.array(z.string()).min(1).optional(),
    assetFromEmployeeName: z.string().optional(),
    assetToEmployeeName: z.string().optional(),
    assetEventDate: z.array(dateField).min(1).optional(),
  })
  .strict()
  .transform(
    ({
      assetName: _assetName,
      assetEventDate: dateRange,
      assetFromEmployeeName,
      assetToEmployeeName,
      assetEventTypes,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        fromUser: assetFromEmployeeName,
        toUser: assetToEmployeeName,
        eventTypes: assetEventTypes,
        startDate: transformDateFormat(start),
        endDate: transformDateFormat(end),
      };
    }
  );

export const AssetEventHistoryGetStatsResponseSchema = z.looseObject({
  total: z.number().int().nonnegative(),
  byEventType: z.object({
    ASSET_ADDED: z.number().int().nonnegative(),
    AVAILABLE: z.number().int().nonnegative(),
    ASSIGNED: z.number().int().nonnegative(),
    DEALLOCATED: z.number().int().nonnegative(),
    UNDER_MAINTENANCE: z.number().int().nonnegative(),
    CALIBRATED: z.number().int().nonnegative(),
    DAMAGED: z.number().int().nonnegative(),
    RETIRED: z.number().int().nonnegative(),
    UPDATED: z.number().int().nonnegative(),
    HANDOVER_INITIATED: z.number().int().nonnegative(),
    HANDOVER_ACCEPTED: z.number().int().nonnegative(),
    HANDOVER_REJECTED: z.number().int().nonnegative(),
    HANDOVER_CANCELLED: z.number().int().nonnegative(),
  }),
});

export const AssetEventHistoryGetBaseResponseObjectSchema = z.looseObject({
  id: uuidField,
  assetMasterId: uuidField,
  eventType: z.string().min(1),
  fromUserId: uuidField.nullable(),
  toUserId: uuidField.nullable(),
  createdAt,
  updatedAt,
  createdById: createdBy,
  createdByUser: UserSchema,
  fromUserDetails: makeFieldsNullable(UserSchema).nullable(),
  toUserDetails: makeFieldsNullable(UserSchema).nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  assetFiles: z.array(makeFieldsNullable(AssetBaseDocumentsSchema)),
  asset: z.object({
    id,
    assetId,
    name,
    model,
    serialNumber,
    category,
    status,
  }),
});

export const AssetEventHistoryGetBaseResponseSchema =
  AssetEventHistoryGetBaseResponseObjectSchema.transform(
    ({ assetFiles, ...rest }) => ({
      ...rest,
      documentKeys: assetFiles.map(file => file.fileKey),
    })
  );

export const AssetEventHistoryGetResponseSchema = z.looseObject({
  records: z.array(AssetEventHistoryGetBaseResponseSchema),
  stats: AssetEventHistoryGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
