import { EButtonActionType } from '@shared/types';

/** Attendance status is only shown for reject (not approve/cancel), when leave has started or is today. */
export const shouldShowAttendanceStatusField = (
  actionType: EButtonActionType,
  fromDate: Date
): boolean => {
  if (actionType !== EButtonActionType.REJECT || !fromDate) {
    return false;
  }

  const leaveFromDate = new Date(fromDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  leaveFromDate.setHours(0, 0, 0, 0);

  return leaveFromDate <= today;
};

/** True when local “today” is on or before the leave start day (approve → default attendance `leave`). */
export const isTodayOnOrBeforeLeaveFromDate = (fromDate: Date): boolean => {
  if (!fromDate) {
    return false;
  }
  const leaveFromDate = new Date(fromDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  leaveFromDate.setHours(0, 0, 0, 0);
  return today.getTime() <= leaveFromDate.getTime();
};
