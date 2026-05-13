import { z } from 'zod';
import { ReportUpsertShapeSchema } from './base-report.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditReportRequestSchema = ReportUpsertShapeSchema.omit({
  jmcNumber: true,
})
  .strict()
  .transform(data => {
    return {
      reportNumber: data.reportNumber,
      reportDate: transformDateFormat(data.reportDate),
      fileKey: data.reportFileKey,
      fileName: data.reportFileName,
      remarks: data.remarks,
    };
  });

export const EditReportResponseSchema = z.looseObject({
  message: z.string(),
});
