import * as z from 'zod';
import {
  DataSyncRunResponseSchema,
  DataSyncStatusResponseSchema,
} from '../schemas/data-sync.schema';

export type IDataSyncStatusResponseDto = z.infer<
  typeof DataSyncStatusResponseSchema
>;
export type IDataSyncRunResponseDto = z.infer<typeof DataSyncRunResponseSchema>;
