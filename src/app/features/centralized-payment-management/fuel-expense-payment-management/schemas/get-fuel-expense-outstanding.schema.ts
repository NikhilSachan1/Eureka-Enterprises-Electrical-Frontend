import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const FuelExpenseOutstandingGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const FuelExpenseOutstandingBankDetailsSchema = z.looseObject({
  bankHolderName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
});

export const FuelExpenseOutstandingGetBaseResponseSchema = z.looseObject({
  userId: uuidField,
  userName: z.string(),
  employeeId: z.string(),
  pendingAmount: z.number(),
  bankDetails: FuelExpenseOutstandingBankDetailsSchema.nullable(),
});

export const FuelExpenseOutstandingGetStatsResponseSchema = z.looseObject({
  totalPendingAmount: z.number(),
});

export const FuelExpenseOutstandingGetResponseSchema = z.looseObject({
  records: z.array(FuelExpenseOutstandingGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
  summary: FuelExpenseOutstandingGetStatsResponseSchema,
});
