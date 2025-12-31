import {
  AuditSchema,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import {
  AssetDetailGetBaseResponseSchema,
  AssetDetailGetDocumentsSchema,
} from './get-asset-detail.schema';
import { makeFieldsNullable } from '@shared/utility';

const { createdAt, updatedAt, createdBy } = AuditSchema.shape;
const { id, name, assetId, model, serialNumber, category, status } =
  AssetDetailGetBaseResponseSchema.shape;

export const AssetEventHistoryGetRequestSchema = z
  .object({
    ...FilterSchema.shape,
  })
  .strict();

export const AssetEventHistoryGetStatsResponseSchema = z.object({}).strict();

export const AssetEventHistoryGetBaseResponseSchema = z
  .object({
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
    assetFiles: z.array(makeFieldsNullable(AssetDetailGetDocumentsSchema)),
    asset: z.object({
      id,
      assetId,
      name,
      model,
      serialNumber,
      category,
      status,
    }),
  })
  .strict()
  .transform(({ assetFiles, ...rest }) => ({
    ...rest,
    documentKeys: assetFiles.map(file => file.fileKey),
  }));

export const AssetEventHistoryGetResponseSchema = z
  .object({
    records: z.array(AssetEventHistoryGetBaseResponseSchema),
    stats: AssetEventHistoryGetStatsResponseSchema.strict().optional(), // TODO: remove optional chaining from stats
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
