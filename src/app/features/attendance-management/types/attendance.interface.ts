import { IAttendanceGetBaseResponseDto } from './attendance.dto';

export interface IAttendance
  extends Omit<
    IAttendanceGetBaseResponseDto,
    | 'workDuration'
    | 'checkInTime'
    | 'checkOutTime'
    | 'notes'
    | 'user'
    | 'status'
  > {
  siteLocation: string;
  clientName: string;
  employeeName: string;
  attendanceStatus: string;
}
