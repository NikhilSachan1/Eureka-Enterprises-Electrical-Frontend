import { z } from 'zod';
import { ReportUpsertShapeSchema } from './base-report.schema';

export const ApproveReportRequestSchema = ReportUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const ApproveReportResponseSchema = z.looseObject({
  message: z.string(),
});
