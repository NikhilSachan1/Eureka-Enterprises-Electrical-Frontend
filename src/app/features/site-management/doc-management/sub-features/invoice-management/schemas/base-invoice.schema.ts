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
  invoiceNumber: z.string().nullable(),
  invoiceDate: onlyDateStringField,
  taxableAmount: z.string().nullable(),
  tdsPercentage: z.string().nullable(),
  tdsAmount: z.string().nullable(),
  gstPercentage: z.string().nullable(),
  gstAmount: z.string().nullable(),
  totalAmount: z.string().nullable(),
  isGstHold: z.boolean(),
  fileKey: z.string().nullable(),
});

export const InvoiceUpsertShapeSchema = z
  .object({
    jmcNumber: z.string(),
    isNoInvoice: z.boolean(),
    invoiceNumber: z.string().nullable(),
    invoiceDate: dateField,
    taxableAmount: z.number().nullable(),
    tdsPercent: z.number().nullable(),
    tdsAmount: z.number().nullable(),
    gstPercent: z.number().nullable(),
    gstAmount: z.number().nullable(),
    totalAmount: z.number().nullable(),
    isGstHold: z.boolean(),
    invoiceFileName: z.string().nullable(),
    invoiceFileKey: z.string().nullable(),
    remarks: z.string().nullable(),
  })
  .strict();
