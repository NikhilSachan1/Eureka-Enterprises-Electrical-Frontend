import { z } from 'zod';
import { ReportUpsertShapeSchema } from './base-report.schema';

export const UnlockRequestReportRequestSchema = ReportUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const UnlockRequestReportResponseSchema = z.looseObject({
  message: z.string(),
});
