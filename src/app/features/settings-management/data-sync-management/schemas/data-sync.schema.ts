import * as z from 'zod';

export const DataSyncStatusResponseSchema = z.looseObject({
  available: z.boolean(),
  reason: z.string().nullable(),
  sourceDatabase: z.string().nullable(),
  targetDatabase: z.string(),
  skippedTables: z.array(z.string()),
});

export const DataSyncRunResponseSchema = z.looseObject({
  message: z.string(),
  sourceDatabase: z.string().nullable(),
  targetDatabase: z.string(),
  tablesCopied: z.number(),
  rowsCopied: z.number(),
  skippedTables: z.array(z.string()),
  missingInSource: z.array(z.string()),
  permissionsKept: z.number().optional(),
  durationMs: z.number(),
  finishedAt: z.string(),
});
