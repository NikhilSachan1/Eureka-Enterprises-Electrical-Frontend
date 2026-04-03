import z from 'zod';
import { DsrUpsertShapeSchema } from './base-dsr.schema';
import { transformDateFormat } from '@shared/utility';

export const DsrEditRequestSchema = DsrUpsertShapeSchema.omit({
  projectName: true,
})
  .strict()
  .transform(data => {
    return {
      statusDate: transformDateFormat(data.statusDate),
      note: data.note,
      workDone: data.workDone,
      reportedEngineerName: data.reportedEngineerName,
      reportedEngineerContact: data.reportedEngineerContact,
      dsrFiles: data.dsrAttachments,
    };
  });

export const DsrEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
