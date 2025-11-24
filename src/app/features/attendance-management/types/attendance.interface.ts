import { IAttendanceGetBaseResponseDto } from './attendance.dto';
import { EAttendanceStatus } from './attendance.enum';

export interface IAttendance
  extends Omit<
    IAttendanceGetBaseResponseDto,
    | 'checkInTime'
    | 'checkOutTime'
    | 'notes'
    | 'user'
    | 'status'
    | 'createdBy'
    | 'approvalBy'
    | 'workDuration'
  > {
  attendanceStatus: string;
  siteLocation: string;
  clientName: string;
  employeeName: string;
  employeeCode?: string;
}

export interface IAttendanceCurrentStatus {
  status: EAttendanceStatus;
  workDuration: number;
  checkInTime: string;
  checkOutTime: string;
  locationName: string;
  clientName: string;
  associateEmployeeName: string;
}
