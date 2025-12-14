import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';
import { makeFieldsNullable, toTitleCase } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus, category } = ExpenseBaseSchema.shape;
const { createdAt, updatedAt } = AuditSchema.shape;

export const ExpenseGetRequestSchema = z
  .object({
    expenseDate: z.array(dateField).min(1).optional(),
    userIds: z.array(uuidField).min(1).optional(),
    approvalStatuses: z.array(approvalStatus).min(1).optional(),
    categories: z.array(category).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ expenseDate: dateRange, ...rest }) => {
    if (!dateRange || dateRange.length < 1) {
      return rest;
    }

    const start = dateRange[0];
    const end = dateRange[dateRange.length - 1];

    const toISODate = (d: Date): string =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .split('T')[0];

    return {
      ...rest,
      startDate: toISODate(start),
      endDate: toISODate(end),
    };
  });

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
