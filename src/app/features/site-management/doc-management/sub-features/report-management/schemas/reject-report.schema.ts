import { z } from 'zod';
import { ReportUpsertShapeSchema } from './base-report.schema';

export const RejectReportRequestSchema = ReportUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const RejectReportResponseSchema = z.looseObject({
  message: z.string(),
});
