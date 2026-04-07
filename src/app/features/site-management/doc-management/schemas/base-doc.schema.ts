import {
  dateField,
  fileField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const DocBaseSchema = z.looseObject({
  id: uuidField,
  documentType: z.string(),
  documentNumber: z.string(),
  documentDate: onlyDateStringField,
  amount: z.string(),
  fileUrl: z.string().nullable(),
  fileName: z.string().nullable(),
  remarks: z.string(),
});

const { documentType, documentNumber, remarks } = DocBaseSchema.shape;

export const DocUpsertShapeSchema = z.object({
  documentType,
  projectName: uuidField,
  documentNumber,
  documentDate: dateField,
  amount: z.number(),
  remarks,
  documentAttachments: z.array(fileField),
});
