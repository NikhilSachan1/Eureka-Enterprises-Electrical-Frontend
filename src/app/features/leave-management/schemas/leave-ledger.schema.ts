import * as z from 'zod';
import { uuidField } from '@shared/schemas';

const MonthAttendanceSchema = z.looseObject({
  month: z.string(),
  workingDays: z.number(),
  presentDays: z.number(),
  halfDays: z.number(),
  paidLeaveDays: z.number(),
  paidDays: z.number(),
  earned: z.number(),
});

export const LeaveLedgerEntrySchema = z.looseObject({
  id: z.string(),
  createdAt: z.string(),
  entryType: z.string(),
  days: z.number(),
  balanceAfter: z.number(),
  periodMonth: z.string().nullable(),
  reason: z.string().nullable(),
  leaveApplicationId: z.string().nullable(),
  createdBy: z
    .looseObject({
      id: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable(),
});

export const LeaveLedgerMonthSchema = MonthAttendanceSchema.extend({
  credited: z.number(),
});

export const LeaveLedgerGetRequestSchema = z
  .object({
    userId: uuidField.optional(),
    financialYear: z.string().optional(),
  })
  .strict();

export const LeaveLedgerGetResponseSchema = z.looseObject({
  userId: z.string(),
  leaveCategory: z.string(),
  financialYear: z.string(),
  summary: z.looseObject({
    credited: z.number(),
    used: z.number(),
    available: z.number(),
  }),
  months: z.array(LeaveLedgerMonthSchema),
  entries: z.array(LeaveLedgerEntrySchema),
});
