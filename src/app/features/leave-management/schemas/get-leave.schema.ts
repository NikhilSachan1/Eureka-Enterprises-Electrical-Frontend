import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';
import { FinancialYearService } from '@core/services/financial-year.service';
import { toTitleCase } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus } = LeaveBaseSchema.shape;

export const LeaveGetRequestSchema = z
  .object({
    leaveDate: z.array(dateField).min(1).optional(),
    userIds: z.array(uuidField).min(1).optional(),
    approvalStatuses: z.array(approvalStatus).min(1).optional(),
    financialYear: z
      .string()
      .default(new FinancialYearService().getFinancialYear()),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ leaveDate: dateRange, ...rest }) => {
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

export const LeaveGetBaseResponseSchema = z
  .object({
    ...LeaveBaseSchema.shape,
    approvalStatus: approvalStatus.transform(toTitleCase),
  })
  .strict();

export const LeaveGetStatsResponseSchema = z
  .object({
    leaveBalance: z.object({
      totalCredited: z.number().nonnegative(),
      totalConsumed: z.number().nonnegative(),
      totalBalance: z.number().nonnegative(),
    }),
    approval: z.object({
      pending: z.number().int().nonnegative(),
      approved: z.number().int().nonnegative(),
      rejected: z.number().int().nonnegative(),
      cancelled: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const LeaveGetResponseSchema = z
  .object({
    records: z.array(LeaveGetBaseResponseSchema),
    stats: LeaveGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
