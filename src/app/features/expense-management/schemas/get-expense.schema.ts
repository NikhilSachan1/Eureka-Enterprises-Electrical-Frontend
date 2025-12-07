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
  getMappedValueFromArrayOfObjects,
  makeFieldsNullable,
  toTitleCase,
} from '@shared/utility';
import { EXPENSE_CATEGORY_DATA } from '@shared/config/static-data.config';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus, category } = ExpenseBaseSchema.shape;
const { createdAt, updatedAt } = AuditSchema.shape;

export const ExpenseGetRequestSchema = z
  .object({
    expenseDate: z.array(dateField).min(1).optional(),
    userIds: z.array(uuidField).min(1).optional(),
    approvalStatuses: z.array(approvalStatus).min(1).optional(),
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
    user: UserSchema.extend({
      id: uuidField.default(''), //TODO: Remove extend and default once we have the employee id functionality
    }),
    approvalByUser: makeFieldsNullable(
      UserSchema.extend({
        employeeId: z.string().default(''), //TODO: Remove extend and default once we have the employee id functionality
        email: z.string().default(''), //TODO: Remove extend and default once we have the employee name functionality
        id: uuidField.default(''), //TODO: Remove extend and default once we have the employee id functionality
      })
    ).nullable(),
    approvalStatus: approvalStatus.transform(toTitleCase),
    category: category.transform(value =>
      getMappedValueFromArrayOfObjects(EXPENSE_CATEGORY_DATA, value)
    ),
    createdAt,
    updatedAt,
  })
  .strict();

export const ExpenseGetStatsResponseSchema = z
  .object({
    balances: z.object({
      openingBalance: z.number().int().nonnegative(),
      closingBalance: z.number().int().nonnegative(),
      totalCredit: z.number().int().nonnegative(),
      totalDebit: z.number().int().nonnegative(),
      periodCredit: z.number().int().nonnegative(),
      periodDebit: z.number().int().nonnegative(),
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
    stats: ExpenseGetStatsResponseSchema,
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
