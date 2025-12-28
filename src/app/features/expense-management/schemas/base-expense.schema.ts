import { isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EExpenseTransactionType } from '../types/expense.enum';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const ExpenseBaseSchema = z
  .object({
    id: uuidField,
    userId: uuidField,
    category: z.string().min(1),
    description: z.string(),
    amount: z.number(),
    transactionId: z.string().nullable(),
    expenseDate: isoDateTimeField,
    paymentMode: z.string().min(1),
    fileKeys: z.array(z.string()),
    isActive: z.boolean().optional(),
    transactionType: z.enum(EExpenseTransactionType),
    approvalStatus: approvalStatusSchema,
    entrySourceType: entrySourceTypeSchema,
    expenseEntryType: expenseEntryTypeSchema,
    originalExpenseId: uuidField.nullable().optional(),
    parentExpenseId: uuidField.nullable().optional(),
    approvalBy: uuidField.nullable(),
    approvalAt: isoDateTimeField.nullable(),
    approvalReason: z.string().trim().nullable(),
    versionNumber: z.number().int().nonnegative().optional(),
    editReason: z.string().trim().nullable().optional(),
  })
  .strict();
