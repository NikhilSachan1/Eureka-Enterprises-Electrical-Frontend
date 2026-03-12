import z from 'zod';
import { DsrUpsertShapeSchema } from './base-dsr.schema';

export const DsrEditRequestSchema = DsrUpsertShapeSchema.omit({
  projectName: true,
  statusDate: true,
})
  .strict()
  .transform(data => {
    return {
      remarks: data.note,
      workTypes: data.workDone,
      reportingEngineerName: data.reportedEngineerName,
      reportingEngineerContact: data.reportedEngineerContact,
      dsrFiles: data.dsrAttachments,
    };
  });

export const DsrEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
