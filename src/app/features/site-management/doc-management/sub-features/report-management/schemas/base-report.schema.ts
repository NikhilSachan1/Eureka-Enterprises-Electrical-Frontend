import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const ReportBaseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  reportNumber: z.string().nullable(),
  reportDate: onlyDateStringField,
  fileKey: z.string().nullable(),
});

export const ReportUpsertShapeSchema = z
  .object({
    jmcNumber: z.string(),
    isNoReport: z.boolean(),
    reportNumber: z.string().nullable(),
    reportDate: dateField,
    reportFileKey: z.string().nullable(),
    reportFileName: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
