import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const PoBaseSchema = z.looseObject({
  id: uuidField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  contractorId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
  poNumber: z.string(),
  poDate: onlyDateStringField,
  taxableAmount: z.string(),
  gstAmount: z.string(),
  totalAmount: z.string(),
  fileKey: z.string(),
});

export const PoUpsertShapeSchema = z
  .object({
    siteName: uuidField,
    partyType: z.enum(EDocContext),
    contractorName: uuidField.nullable(),
    vendorName: uuidField.nullable(),
    poNumber: z.string(),
    poDate: dateField,
    taxableAmount: z.number(),
    gstAmount: z.number(),
    totalAmount: z.number(),
    fileKey: z.string(),
    remarks: z.string().nullable(),
  })
  .strict();
