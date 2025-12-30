import { AuditSchema, FilterSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { AssetDetailGetDocumentsSchema } from './get-asset-detail.schema';
import { makeFieldsNullable } from '@shared/utility';

export const AssetEventHistoryGetRequestSchema = z
  .object({
    ...FilterSchema.shape,
  })
  .strict();

export const AssetEventHistoryGetDocumentsSchema =
  AssetDetailGetDocumentsSchema;

export const AssetEventHistoryGetEventsSchema = z
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

export const AssetEventHistoryGetStatsResponseSchema = z.object({}).strict();

export const AssetEventHistoryGetBaseResponseSchema = z
  .object({
    ...AssetEventHistoryGetEventsSchema.shape,
    assetFiles: z.array(
      makeFieldsNullable(AssetEventHistoryGetDocumentsSchema)
    ),
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
