import { uuidField } from '@shared/schemas';
import { DsrUpsertShapeSchema } from './base-dsr.schema';
import { transformDateFormat } from '@shared/utility';
import { DsrAddResponseSchema } from './add-dsr.schema';

export const DsrForceRequestSchema = DsrUpsertShapeSchema.extend({
  employeeName: uuidField,
})
  .strict()
  .transform(data => ({
    userId: data.employeeName,
    siteId: data.projectName,
    reportDate: transformDateFormat(data.statusDate),
    remarks: data.note,
    workTypes: data.workDone,
    reportingEngineerName: data.reportedEngineerName,
    reportingEngineerContact: data.reportedEngineerContact,
    dsrFiles: data.dsrAttachments,
  }));

export const DsrForceResponseSchema = DsrAddResponseSchema;
