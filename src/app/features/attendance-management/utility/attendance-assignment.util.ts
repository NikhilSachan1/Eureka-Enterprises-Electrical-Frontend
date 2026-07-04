import { EAttendanceStatus } from '../types/attendance.enum';

export function isAttendanceAssignmentApplicable(
  status: string | null | undefined
): boolean {
  if (!status?.trim()) {
    return false;
  }

  return status === EAttendanceStatus.PRESENT;
}

export const NULL_ASSIGNMENT_FORM_VALUES = {
  company: null,
  contractor: null,
  vehicle: null,
  assignedEngineer: null,
};
