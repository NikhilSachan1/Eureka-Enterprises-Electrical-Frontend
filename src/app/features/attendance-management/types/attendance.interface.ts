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
  employeeName: string;
  employeeCode: string;
  projectName: string | null;
  projectLocation: string | null;
  originalRawData: IAttendanceGetBaseResponseDto;
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

export interface IAttendanceAssignmentPerson {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  employeeId?: string | null;
}

export interface IAttendanceAssignmentPayload {
  site?: {
    id?: string | null;
    name?: string | null;
    city?: string | null;
    state?: string | null;
    fullAddress?: string | null;
  } | null;
  vehicle?: {
    id?: string | null;
    registrationNo?: string | null;
    brand?: string | null;
    model?: string | null;
  } | null;
  assignedDrivers?: IAttendanceAssignmentPerson[] | null;
  assignedEngineer?: IAttendanceAssignmentPerson | null;
  user?: IAttendanceAssignmentPerson | null;
  assignmentSnapshot?: IAttendanceAssignmentPayload | null;
}

export interface IAttendanceAssignmentFormValues {
  assignedDriver: string | string[] | null;
}

export interface IAttendanceAssignmentSubmitPayload {
  assignedDriver: string | string[] | null;
}
