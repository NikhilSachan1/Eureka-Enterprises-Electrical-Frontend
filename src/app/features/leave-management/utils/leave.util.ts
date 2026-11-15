import { EButtonActionType, EPrimeNGSeverity } from '@shared/types';
import { StatusUtil } from '@shared/utility';

/** "3 Approved", coloured like the status itself. */
export interface ILeaveStatusChip {
  status: string;
  label: string;
  severity: EPrimeNGSeverity;
}

const LEAVE_STATUS_ORDER = [
  'approved',
  'pending',
  'rejected',
  'cancelled',
] as const;

const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** One chip per status that has days, e.g. [3 Approved] [1 Rejected]. */
export const buildLeaveStatusChips = (
  counts: Partial<Record<string, number>>
): ILeaveStatusChip[] =>
  LEAVE_STATUS_ORDER.filter(status => (counts[status] ?? 0) > 0).map(
    status => ({
      status,
      label: `${counts[status]} ${titleCase(status)}`,
      severity: StatusUtil.getSeverity(titleCase(status)) as EPrimeNGSeverity,
    })
  );

/** "fullDay" → "Full Day", "CASUAL_LEAVE" → "Casual Leave". */
export const formatLeaveLabel = (value: string | null | undefined): string =>
  (value ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();

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
