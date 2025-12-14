import { isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';
import { EExpenseTransactionType } from '../types/expense.enum';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import {
  EXPENSE_CATEGORY_DATA,
  EXPENSE_PAYMENT_METHOD_DATA,
} from '@shared/config/static-data.config';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const expenseEntryTypeSchema = z.enum(EEntryType);

export const ExpenseBaseSchema = z
  .object({
    id: uuidField,
    userId: uuidField,
    category: z.enum(EXPENSE_CATEGORY_DATA.map(item => item.value)),
    description: z.string(),
    amount: z.number(),
    transactionId: z.string().nullable(),
    expenseDate: isoDateTimeField,
    paymentMode: z.enum(EXPENSE_PAYMENT_METHOD_DATA.map(item => item.value)),
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
