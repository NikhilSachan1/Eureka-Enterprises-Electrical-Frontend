import * as z from 'zod';
import { FilterSchema, uuidField } from '@shared/schemas';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

/** "2026-27" (the FY dropdown) → "2026-2027" (the API). */
const toApiFinancialYear = (value: string): string => {
  const start = Number(value.slice(0, 4));
  return Number.isFinite(start) ? `${start}-${start + 1}` : value;
};

/**
 * Filter bar + table state → ledger query. The employee picked in the filter becomes `userId`
 * (HR looking at someone); without it the API answers with the signed-in employee's own ledger.
 */
export const LeaveLedgerGetRequestSchema = z
  .object({
    employeeName: z
      .union([uuidField, z.array(uuidField)])
      .nullable()
      .optional(),
    financialYear: z.string().nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ employeeName, financialYear, ...paging }) => {
    const userId = Array.isArray(employeeName)
      ? employeeName[0]
      : (employeeName ?? undefined);
    return {
      ...(userId ? { userId } : {}),
      ...(financialYear
        ? { financialYear: toApiFinancialYear(financialYear) }
        : {}),
      pageSize: paging.pageSize,
      page: paging.page,
    };
  });

const LedgerUserSchema = z.looseObject({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const LeaveLedgerRecordSchema = z.looseObject({
  id: z.string(),
  date: z.string(),
  entryType: z.string(),
  credit: z.number(),
  debit: z.number(),
  days: z.number(),
  balance: z.number(),
  periodMonth: z.string().nullable(),
  leaveDate: z.string().nullable(),
  leaveDateTo: z.string().nullable(),
  dayCount: z.number(),
  workingDays: z.number().nullable(),
  paidDays: z.number().nullable(),
  reason: z.string().nullable(),
  createdBy: LedgerUserSchema.nullable(),
});

export const LeaveLedgerGetResponseSchema = z.looseObject({
  userId: z.string(),
  leaveCategory: z.string(),
  financialYear: z.string(),
  summary: z.looseObject({
    earned: z.number(),
    used: z.number(),
    available: z.number(),
  }),
  records: z.array(LeaveLedgerRecordSchema),
  totalRecords: z.number(),
});
