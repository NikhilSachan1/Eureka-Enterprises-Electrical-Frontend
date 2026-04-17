import { dateField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { z } from 'zod';

export const CronRunRequestSchema = z
  .object({
    cronName: z.string().min(1),
    runDate: dateField.nullable(),
    runMonth: dateField.nullable(),
    runYear: dateField.nullable(),
    isDryRun: z.boolean(),
    isSkipDependencyCheck: z.boolean(),
    isForceRun: z.boolean(),
  })
  .strict()
  .transform(data => {
    let month: number | null = null;
    let year: number | null = null;

    if (data.runMonth) {
      month = data.runMonth.getMonth() + 1;
      year = data.runYear
        ? data.runYear.getFullYear()
        : data.runMonth.getFullYear();
    } else if (data.runYear) {
      year = data.runYear.getFullYear();
    } else if (data.runDate) {
      month = data.runDate.getMonth() + 1;
      year = data.runDate.getFullYear();
    }

    return {
      jobName: data.cronName,
      date: data.runDate ? transformDateFormat(data.runDate) : null,
      month,
      year,
      dryRun: data.isDryRun,
      skipDependencyCheck: data.isSkipDependencyCheck,
      forceRun: data.isForceRun,
    };
  });

export const CronRunResponseSchema = z.looseObject({
  success: z.boolean(),
  message: z.string(),
  jobName: z.string(),
  details: z.looseObject({
    recordsProcessed: z.number(),
    recordsSkipped: z.number(),
    recordsFailed: z.number(),
    errors: z.array(z.unknown()),
    duration: z.number(),
  }),
  parameters: z.looseObject({
    date: z.string().optional(),
    month: z.number().optional(),
    year: z.number().optional(),
  }),
  dryRun: z.boolean(),
});
