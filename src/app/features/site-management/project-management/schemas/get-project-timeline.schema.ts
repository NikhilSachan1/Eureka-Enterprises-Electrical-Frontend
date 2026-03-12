import { z } from 'zod';
import { uuidField } from '@shared/schemas';

const ProjectTimelineEventBaseSchema = z.looseObject({
  id: uuidField,
  date: z.string(),
  title: z.string(),
  description: z.string(),
  actor: z.string().nullable(),
});

export const ProjectTimelineGetResponseSchema = z
  .object({
    siteId: uuidField,
    siteName: z.string(),
    currentStatus: z.string(),
    startDate: z.string(),
    expectedEndDate: z.string(),
    daysElapsed: z.number().int().nonnegative(),
    daysRemaining: z.number().int(),
    completionPercent: z.number().min(0).max(100),
    timeline: z.array(ProjectTimelineEventBaseSchema),
  })
  .loose();
