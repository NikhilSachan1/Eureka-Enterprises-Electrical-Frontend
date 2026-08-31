import { IAttendanceGetBaseResponseDto } from './attendance.dto';
import { EAttendanceStatus } from './attendance.enum';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import type { z } from 'zod';

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
  company?: {
    id?: string | null;
    name?: string | null;
    city?: string | null;
    state?: string | null;
    fullAddress?: string | null;
  } | null;
  contractors?: Array<
    { id?: string | null; name?: string | null } | null | undefined
  > | null;
  vehicle?: { id?: string | null; registrationNo?: string | null } | null;
  assignedEngineer?: IAttendanceAssignmentPerson | null;
  user?: IAttendanceAssignmentPerson | null;
  assignmentSnapshot?: IAttendanceAssignmentPayload | null;
}

export interface IAttendanceAssignmentFormValues {
  company: string | null;
  contractor: string | null;
  vehicle: string | null;
  assignedEngineer: string | null;
}

export interface IAttendanceAssignmentSubmitPayload {
  company: ICompanyGetBaseResponseDto | null;
  contractor: IContractorGetBaseResponseDto | null;
  vehicle: z.infer<typeof VehicleBaseSchema> | null;
  assignedEngineer: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  } | null;
}
