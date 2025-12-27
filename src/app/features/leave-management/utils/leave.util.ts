import { EButtonActionType } from '@shared/types';

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
