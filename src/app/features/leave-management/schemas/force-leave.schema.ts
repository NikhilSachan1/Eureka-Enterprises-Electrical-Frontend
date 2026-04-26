import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { LeaveUpsertShapeSchema } from './base-leave.schema';
import { transformDateFormat } from '@shared/utility';
import { ELeaveCategory, ELeaveDayType } from '../types/leave.type';

export const LeaveForceRequestSchema = LeaveUpsertShapeSchema.extend({
  employeeName: uuidField,
})
  .strict()
  .transform(({ employeeName, leaveDate, leaveReason }) => {
    const [fromDate, toDate] = leaveDate;
    return {
      userId: employeeName,
      fromDate: transformDateFormat(fromDate),
      toDate: transformDateFormat(toDate),
      leaveType: ELeaveDayType.FULL_DAY,
      leaveCategory: ELeaveCategory.EARNED,
      reason: leaveReason,
      approvalReason: leaveReason,
    };
  });

/** Normalizes force-leave API payloads into `result` / `errors` for bulk notifications. */
export const LeaveForceResponseSchema = z
  .looseObject({
    message: z.string(),
    appliedDates: z.array(z.string()).optional(),
    skippedDates: z
      .array(
        z.looseObject({
          date: z.string(),
          reason: z.string(),
        })
      )
      .optional(),
  })
  .transform(({ message, appliedDates, skippedDates }) => {
    const applied = appliedDates ?? [];
    const skipped = skippedDates ?? [];

    if (applied.length === 0 && skipped.length === 0) {
      return {
        message,
        result: [{ message }],
        errors: [] as { error: string }[],
      };
    }

    return {
      message,
      result: applied.map(date => ({
        message: `Leave applied for ${date}.`,
      })),
      errors: skipped.map(row => ({
        error:
          row.reason?.trim() || `Could not apply force leave for ${row.date}.`,
      })),
    };
  });
