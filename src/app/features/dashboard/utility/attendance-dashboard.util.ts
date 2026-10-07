import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import type { IAttendanceGetBaseResponseDto } from '@features/attendance-management/types/attendance.dto';
import {
  getAssignedDriverDisplayName,
  getAssignedEmployeeDisplayName,
} from '@features/attendance-management/utility/attendance-assignment.util';
import type {
  IDashboardAttendanceTrailStop,
  IDashboardTodayAttendanceRow,
} from '@features/dashboard/types/dashboard.interface';
import { ICONS } from '@shared/constants';
import { StatusSeverity } from '@shared/types';
import { StatusUtil } from '@shared/utility';

export function buildAssignmentTrail(
  record: IAttendanceGetBaseResponseDto
): IDashboardAttendanceTrailStop[] {
  const snapshot = record.assignmentSnapshot;
  const stops: IDashboardAttendanceTrailStop[] = [];
  const vehicleNo = snapshot?.vehicle?.registrationNo?.trim();
  const driverName = getAssignedDriverDisplayName(record);
  const employeeName = getAssignedEmployeeDisplayName(record);
  const personName = driverName ?? employeeName;
  const personLabel = driverName
    ? driverName.includes(',')
      ? 'Assigned Drivers'
      : 'Assigned Driver'
    : 'Assigned Engineer';

  if (personName) {
    stops.push({
      kind: 'person',
      label: personLabel,
      value: personName,
      icon: ICONS.COMMON.USER,
    });
  }

  if (vehicleNo) {
    stops.push({
      kind: 'vehicle',
      label: 'Vehicle',
      value: vehicleNo,
      icon: ICONS.COMMON.CAR,
    });
  }

  return stops;
}

export function compareDashboardAttendanceRows(
  left: IDashboardTodayAttendanceRow,
  right: IDashboardTodayAttendanceRow
): number {
  const byAttention =
    attendanceAttentionRank(left.statusKey) -
    attendanceAttentionRank(right.statusKey);
  if (byAttention !== 0) {
    return byAttention;
  }

  return left.employeeName.localeCompare(right.employeeName);
}

export function resolveAttendanceTone(status: string): StatusSeverity {
  switch (status) {
    case EAttendanceStatus.CHECKED_IN:
    case EAttendanceStatus.CHECKED_OUT:
    case EAttendanceStatus.PRESENT:
      return 'success';
    case EAttendanceStatus.ABSENT:
      return 'danger';
    case EAttendanceStatus.LEAVE:
    case EAttendanceStatus.NOT_CHECKED_IN_YET:
    case EAttendanceStatus.APPROVAL_PENDING:
      return 'warning';
    case EAttendanceStatus.HOLIDAY:
      return 'purple';
    default:
      return StatusUtil.getSeverityType(status);
  }
}

function attendanceAttentionRank(status: string): number {
  switch (status) {
    case EAttendanceStatus.NOT_CHECKED_IN_YET:
      return 0;
    case EAttendanceStatus.ABSENT:
      return 1;
    case EAttendanceStatus.APPROVAL_PENDING:
      return 2;
    case EAttendanceStatus.LEAVE:
      return 3;
    default:
      return 4;
  }
}
