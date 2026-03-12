import {
  dateField,
  fileField,
  isoDateTimeField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';

export const DsrBaseSchema = z
  .object({
    id: uuidField,
    siteId: uuidField,
    userId: uuidField,
    reportDate: onlyDateStringField,
    workTypes: z.array(z.string()),
    workDescription: z.string().nullable(),
    hoursWorked: z.string(),
    challenges: z.string().nullable(),
    reportingEngineerName: z.string(),
    reportingEngineerContact: z.string(),
    weatherCondition: z.string().nullable(),
    manpowerCount: z.number().int().nonnegative().nullable(),
    equipmentUsed: z.array(z.string()).nullable(),
    status: z.string(),
    approvedBy: uuidField.nullable(),
    approvedAt: isoDateTimeField.nullable(),
    remarks: z.string(),
  })
  .loose();

const { siteId, workTypes, remarks, reportingEngineerName } =
  DsrBaseSchema.shape;

export const DsrUpsertShapeSchema = z
  .object({
    projectName: siteId,
    statusDate: dateField,
    note: remarks,
    workDone: workTypes,
    reportedEngineerName: reportingEngineerName,
    reportedEngineerContact: z.number(),
    dsrAttachments: z.array(fileField),
  })
  .strict();
