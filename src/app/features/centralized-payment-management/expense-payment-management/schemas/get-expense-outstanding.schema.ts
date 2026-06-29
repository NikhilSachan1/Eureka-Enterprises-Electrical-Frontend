import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ExpenseOutstandingGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const ExpenseOutstandingBankDetailsSchema = z.looseObject({
  bankHolderName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
});

export const ExpenseOutstandingGetBaseResponseSchema = z.looseObject({
  userId: uuidField,
  userName: z.string(),
  employeeId: z.string(),
  pendingAmount: z.number(),
  bankDetails: ExpenseOutstandingBankDetailsSchema.nullable(),
});

export const ExpenseOutstandingGetStatsResponseSchema = z.looseObject({
  totalPendingAmount: z.number(),
});

export const ExpenseOutstandingGetResponseSchema = z.looseObject({
  records: z.array(ExpenseOutstandingGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  summary: ExpenseOutstandingGetStatsResponseSchema,
});
