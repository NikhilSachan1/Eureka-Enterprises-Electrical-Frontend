import { ILeaveGetBaseResponseDto } from './leave.dto';

export interface ILeave
  extends Omit<
    ILeaveGetBaseResponseDto,
    | 'userId'
    | 'leaveType'
    | 'leaveCategory'
    | 'leaveApplicationType'
    | 'approvalAt'
    | 'approvalBy'
    | 'approvalReason'
    | 'entrySourceType'
    | 'approvalByUser'
    | 'user'
    | 'createdByUser'
    | 'createdAt'
    | 'updatedAt'
    | 'createdBy'
    | 'updatedBy'
    | 'fromDate'
    | 'toDate'
  > {
  employeeName: string;
  employeeCode: string;
  leaveDate: string;
  originalRawData: ILeaveGetBaseResponseDto;
}
