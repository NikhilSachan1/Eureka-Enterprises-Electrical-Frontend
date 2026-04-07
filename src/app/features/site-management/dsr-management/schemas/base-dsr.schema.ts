import {
  dateField,
  fileField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';

export const DsrBaseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  reportDate: onlyDateStringField,
  workTypes: z.array(z.string()),
  workDescription: z.string().nullable(),
  reportingEngineerName: z.string(),
  reportingEngineerContact: z.string(),
  remarks: z.string(),
});

const { siteId, workTypes, remarks, reportingEngineerName } =
  DsrBaseSchema.shape;

export const DsrUpsertShapeSchema = z
  .object({
    projectName: siteId,
    statusDate: dateField,
    note: remarks,
    workDone: workTypes,
    reportedEngineerName: reportingEngineerName,
    reportedEngineerContact: z.number().nullable(),
    dsrAttachments: z.array(fileField),
  })
  .strict();
