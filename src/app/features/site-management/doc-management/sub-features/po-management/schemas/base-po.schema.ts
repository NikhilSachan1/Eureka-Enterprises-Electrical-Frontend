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
  poNumber: z.string(),
  poDate: onlyDateStringField,
  taxableAmount: z.string(),
  gstPercentage: z.string(),
  gstAmount: z.string(),
  totalAmount: z.string(),
  fileKey: z.string().nullable(),
  contractorId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
});

export const PoItemUpsertSchema = z
  .object({
    itemName: z.string().min(1).max(255),
    hsnCode: z.string().max(20).nullable().optional(),
    make: z.string().max(255).nullable().optional(),
    quantity: z.number().min(0),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })
  .strict();

export const PoUpsertShapeSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
    contractorName: uuidField.nullable(),
    vendorName: uuidField.nullable(),
    poNumber: z.string().nullable(),
    poDate: dateField,
    taxableAmount: z.number().nullable(),
    gstPercent: z.number().nullable(),
    gstAmount: z.number().nullable(),
    totalAmount: z.number().nullable(),
    poFileName: z.string().nullable(),
    poFileKey: z.string().nullable(),
    gstType: z.string().nullable(),
    remarks: z.string().nullable(),
    items: z.array(PoItemUpsertSchema).nullable(),
  })
  .strict();
