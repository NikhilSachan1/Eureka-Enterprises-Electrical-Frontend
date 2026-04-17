import { z } from 'zod';

export const CronGetJobSchema = z.looseObject({
  name: z.string(),
  description: z.string(),
  requiredParameters: z.array(z.string()),
  dependencies: z.array(z.string()),
});

export const CronGetResponseSchema = z.looseObject({
  jobs: z.array(CronGetJobSchema),
});
