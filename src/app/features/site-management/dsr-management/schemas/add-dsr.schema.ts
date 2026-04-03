import z from 'zod';
import { DsrUpsertShapeSchema } from './base-dsr.schema';
import { transformDateFormat } from '@shared/utility';

export const DsrAddRequestSchema = DsrUpsertShapeSchema.strict().transform(
  data => {
    return {
      siteId: data.projectName,
      reportDate: transformDateFormat(data.statusDate),
      remarks: data.note,
      workTypes: data.workDone,
      reportingEngineerName: data.reportedEngineerName,
      reportingEngineerContact: data.reportedEngineerContact,
      dsrFiles: data.dsrAttachments,
    };
  }
);

export const DsrAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
