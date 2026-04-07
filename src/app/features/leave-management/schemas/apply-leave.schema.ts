import { z } from 'zod';
import { ELeaveCategory, ELeaveDayType } from '../types/leave.type';
import { LeaveUpsertShapeSchema } from './base-leave.schema';
import { transformDateFormat } from '@shared/utility';

export const LeaveApplyRequestSchema =
  LeaveUpsertShapeSchema.strict().transform(({ leaveDate, leaveReason }) => {
    const [fromDate, toDate] = leaveDate;
    return {
      fromDate: transformDateFormat(fromDate),
      toDate: transformDateFormat(toDate),
      leaveType: ELeaveDayType.FULL_DAY,
      leaveCategory: ELeaveCategory.EARNED,
      reason: leaveReason,
    };
  });

export const LeaveApplyResponseSchema = z.looseObject({
  message: z.string(),
});
