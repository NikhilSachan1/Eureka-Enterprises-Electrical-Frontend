import { EAttendanceStatus } from '../types/attendance.enum';

const NON_ASSIGNMENT_STATUSES: ReadonlySet<string> = new Set([
  EAttendanceStatus.HOLIDAY,
  EAttendanceStatus.LEAVE,
  EAttendanceStatus.ABSENT,
]);

export function isAttendanceAssignmentApplicable(
  status: string | null | undefined
): boolean {
  if (!status?.trim()) {
    return false;
  }

  return !NON_ASSIGNMENT_STATUSES.has(status);
}

export const NULL_ASSIGNMENT_FORM_VALUES = {
  company: null,
  contractor: null,
  vehicle: null,
  assignedEngineer: null,
};
