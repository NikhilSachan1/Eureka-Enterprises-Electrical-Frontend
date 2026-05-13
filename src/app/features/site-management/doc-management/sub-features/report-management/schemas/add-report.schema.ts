import { z } from 'zod';
import { ReportUpsertShapeSchema } from './base-report.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddReportRequestSchema = ReportUpsertShapeSchema.transform(
  data => {
    return {
      jmcId: data.jmcNumber,
      reportNumber: data.reportNumber,
      reportDate: transformDateFormat(data.reportDate),
      fileKey: data.reportFileKey,
      fileName: data.reportFileName,
      remarks: data.remarks,
    };
  }
);

export const AddReportResponseSchema = z.looseObject({
  message: z.string(),
});
