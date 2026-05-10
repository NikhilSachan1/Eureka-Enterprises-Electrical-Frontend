import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const JmcBaseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  contractorId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
  jmcNumber: z.string(),
  jmcDate: onlyDateStringField,
  taxableAmount: z.string(),
  gstAmount: z.string(),
  totalAmount: z.string(),
  fileKey: z.string(),
});

export const JmcUpsertShapeSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
    contractorName: uuidField.nullable(),
    vendorName: uuidField.nullable(),
    jmcNumber: z.string(),
    jmcDate: dateField,
    taxableAmount: z.number(),
    gstAmount: z.number(),
    totalAmount: z.number(),
    jmcFileName: z.string(),
    jmcFileKey: z.string(),
    remarks: z.string().nullable(),
  })
  .strict();
