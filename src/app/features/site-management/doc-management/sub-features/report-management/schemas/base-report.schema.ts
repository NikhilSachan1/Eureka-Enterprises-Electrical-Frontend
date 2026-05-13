import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const ReportBaseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  reportNumber: z.string(),
  reportDate: onlyDateStringField,
  fileKey: z.string(),
});

export const ReportUpsertShapeSchema = z
  .object({
    jmcNumber: z.string(),
    reportNumber: z.string(),
    reportDate: dateField,
    reportFileKey: z.string(),
    reportFileName: z.string(),
    remarks: z.string().nullable(),
  })
  .strict();
