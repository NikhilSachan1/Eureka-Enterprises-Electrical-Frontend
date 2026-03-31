import { EApprovalStatus } from '@shared/types';
import { SHIFT_DATA } from '@shared/config';
import { IAttendanceGetBaseResponseDto } from '../types/attendance.dto';
import { EAttendanceStatus } from '../types/attendance.enum';

/**
 * Attendance not marked + approval N/A — no attendance applied yet; all row actions disabled.
 */
export const isNoAttendanceNotCheckedInWithNA = (
  row: IAttendanceGetBaseResponseDto
): boolean =>
  row.status === EAttendanceStatus.NOT_CHECKED_IN_YET &&
  row.approvalStatus === EApprovalStatus.NOT_APPLICABLE;

/** `attendanceDate` is `YYYY-MM-DD` (API) vs today’s local calendar date. */
export const isAttendanceDateToday = (attendanceDate: string): boolean => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return attendanceDate === `${y}-${m}-${d}`;
};

/** True while local time is still before `shiftEndHHmm` (`HH:mm`) on the current calendar day. */
export const isBeforeLocalShiftEnd = (shiftEndHHmm: string): boolean => {
  const [hours, minutes] = shiftEndHHmm.split(':').map(Number);
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return now < end;
};

/** Regularize disabled for “today” row until configured shift end. */
export const isRegularizeDisabledForTodayBeforeShiftEnd = (
  row: IAttendanceGetBaseResponseDto
): boolean =>
  isAttendanceDateToday(row.attendanceDate) &&
  isBeforeLocalShiftEnd(SHIFT_DATA.END_TIME);
