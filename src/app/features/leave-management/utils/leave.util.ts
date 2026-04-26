import { EButtonActionType } from '@shared/types';

/**
 * Leave start date (calendar day) is today or already passed.
 * Used when attendance may be tied to an existing or current period — not for future-only leave.
 */
export const isLeaveStartOnOrBeforeToday = (fromDate: Date): boolean => {
  if (!fromDate) {
    return false;
  }
  const leaveFromDate = new Date(fromDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  leaveFromDate.setHours(0, 0, 0, 0);
  return leaveFromDate.getTime() <= today.getTime();
};

/** Attendance status is only shown for reject (not approve/cancel), when leave has started or is today. */
export const shouldShowAttendanceStatusField = (
  actionType: EButtonActionType,
  fromDate: Date
): boolean => {
  if (actionType !== EButtonActionType.REJECT || !fromDate) {
    return false;
  }
  return isLeaveStartOnOrBeforeToday(fromDate);
};
