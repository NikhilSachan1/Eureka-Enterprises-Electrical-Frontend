import { IAttendanceForceFormDto } from '@features/attendance-management/types/attendance.dto';
import {
  getRandomDate,
  getRandomItem,
  TEST_ATTENDANCE_STATUSES,
  TEST_EMPLOYEE_LIST,
} from './mock-data.constants';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';

export const FORCE_ATTENDANCE_PREFILLED_DATA: IAttendanceForceFormDto = {
  employeeName: getRandomItem(TEST_EMPLOYEE_LIST),
  attendanceDate: getRandomDate(7, 3),
  attendanceStatus: getRandomItem(
    TEST_ATTENDANCE_STATUSES
  ) as EAttendanceStatus,
  remark: 'System regularization - Employee was on field duty',
  company: null,
  contractors: [],
  vehicle: null,
  assignedEngineer: null,
};
