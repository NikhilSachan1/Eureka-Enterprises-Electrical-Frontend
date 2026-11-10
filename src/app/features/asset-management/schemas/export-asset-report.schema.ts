import { AttachmentsGetResponseSchema, uuidField } from '@shared/schemas';
import * as z from 'zod';

export const AssetExportReportRequestSchema = z
  .object({
    assetMasterIds: z.array(uuidField).min(1),
  })
  .strict();

export const AssetExportReportResponseSchema = AttachmentsGetResponseSchema;
