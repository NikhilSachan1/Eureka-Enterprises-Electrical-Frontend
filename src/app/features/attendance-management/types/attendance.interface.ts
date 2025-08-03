import { IAttendanceGetBaseResponseDto } from './attendance.dto';

export interface IAttendance
  extends Omit<
    IAttendanceGetBaseResponseDto,
    'checkInTime' | 'checkOutTime' | 'notes' | 'user' | 'status'
  > {
  siteLocation: string;
  clientName: string;
  employeeName: string;
  employeeCode: string;
  employeeId: string;
  attendanceStatus: string;
}
