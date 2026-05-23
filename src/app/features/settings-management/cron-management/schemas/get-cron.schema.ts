import { isoDateTimeField } from '@shared/schemas';
import { z } from 'zod';

export const CronGetJobSchema = z.looseObject({
  name: z.string(),
  description: z.string(),
  requiredParameters: z.array(z.string()),
  dependencies: z.array(z.string()),
  schedule: z.string(),
  cronExpression: z.string(),
  nextRunAt: isoDateTimeField,
});

export const CronGetResponseSchema = z.looseObject({
  jobs: z.array(CronGetJobSchema),
});
