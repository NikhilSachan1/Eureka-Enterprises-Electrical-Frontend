import { LeaveApplyResponseSchema } from './apply-leave.schema';
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
    };
  });

export const LeaveForceResponseSchema = LeaveApplyResponseSchema.strict();
