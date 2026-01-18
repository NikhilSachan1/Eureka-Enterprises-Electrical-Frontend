import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';
import {
  makeFieldsNullable,
  toTitleCase,
  transformDateFormat,
} from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus, category } = ExpenseBaseSchema.shape;
const { createdAt, updatedAt } = AuditSchema.shape;

export const ExpenseGetRequestSchema = z
  .object({
    expenseDate: z.array(dateField).min(1).optional(),
    employeeName: z.array(uuidField).min(1).optional(),
    approvalStatus: z.array(approvalStatus).min(1).optional(),
    expenseType: z.array(category).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      expenseDate: dateRange,
      employeeName,
      approvalStatus: expenseApprovalStatus,
      expenseType,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];

      return {
        ...rest,
        userIds: employeeName,
        approvalStatuses: expenseApprovalStatus,
        categories: expenseType,
        startDate: transformDateFormat(start),
        endDate: transformDateFormat(end),
      };
    }
  );

export const ExpenseGetBaseResponseSchema = z
  .object({
    ...ExpenseBaseSchema.shape,
    user: UserSchema,
    approvalByUser: makeFieldsNullable(UserSchema).nullable(),
    approvalStatus: approvalStatus.transform(toTitleCase),
    createdAt,
    updatedAt,
  })
  .strict();

export const ExpenseGetStatsResponseSchema = z
  .object({
    balances: z.object({
      openingBalance: z.number(),
      closingBalance: z.number(),
      totalCredit: z.number().nonnegative(),
      totalDebit: z.number().nonnegative(),
      periodCredit: z.number().nonnegative(),
      periodDebit: z.number().nonnegative(),
    }),
    approval: z.object({
      pending: z.number().int().nonnegative(),
      approved: z.number().int().nonnegative(),
      rejected: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const ExpenseGetResponseSchema = z
  .object({
    records: z.array(ExpenseGetBaseResponseSchema),
    stats: ExpenseGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
