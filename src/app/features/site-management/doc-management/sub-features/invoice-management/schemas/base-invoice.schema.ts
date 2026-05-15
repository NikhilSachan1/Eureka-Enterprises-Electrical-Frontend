import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const InvoiceBaseSchema = z.looseObject({
  id: uuidField,
  jmcId: uuidField,
  siteId: uuidField,
  partyType: z.enum(EDocContext),
  invoiceNumber: z.string(),
  invoiceDate: onlyDateStringField,
  taxableAmount: z.string(),
  gstPercentage: z.string(),
  gstAmount: z.string(),
  totalAmount: z.string(),
  fileKey: z.string(),
});

export const InvoiceUpsertShapeSchema = z
  .object({
    jmcNumber: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: dateField,
    taxableAmount: z.number(),
    gstPercent: z.number(),
    gstAmount: z.number(),
    totalAmount: z.number(),
    invoiceFileName: z.string(),
    invoiceFileKey: z.string(),
    remarks: z.string().nullable(),
  })
  .strict();
