import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectDeleteRequestSchema = z
  .object({
    projectIds: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => {
    return {
      siteIds: data.projectIds,
    };
  });

export const ProjectDeleteResultSchema = z
  .object({
    id: uuidField,
    message: z.string(),
    success: z.boolean(),
  })
  .strict();

export const ProjectDeleteResponseSchema = z
  .object({
    message: z.string(),
    failureCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    totalRequested: z.number().int().nonnegative(),
    results: z.array(ProjectDeleteResultSchema),
  })
  .strict();
